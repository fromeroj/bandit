import "dotenv/config";
import { getDb } from "./api/queries/connection";
import { priceSnapshots, trades } from "./db/schema";
import { eq, gte, and } from "drizzle-orm";

const BTC_QTY = 0.00125;
const MAKER_FEE_PCT = 0.1;
const TAKER_FEE_PCT = 0.1;
const WINDOW_SIZE = 12 * 60;
const K = 2.0;

async function backfill() {
  const db = getDb();

  const lookbackStart = new Date("2026-04-30T12:00:00Z");
  console.log("Fetching prices with 12h lookback...");
  const rows = await db
    .select({
      t: priceSnapshots.closeTime,
      p: priceSnapshots.price,
    })
    .from(priceSnapshots)
    .where(
      and(
        eq(priceSnapshots.symbol, "BTCUSDT"),
        gte(priceSnapshots.closeTime, lookbackStart)
      )
    )
    .orderBy(priceSnapshots.closeTime);

  console.log(`Got ${rows.length} candles`);

  const may1 = new Date("2026-05-01T00:00:00Z").getTime();
  const windowPrices: number[] = [];
  const buyQueue: { price: number; time: Date }[] = [];
  const tradeList: any[] = [];

  let belowLower = false;
  let aboveUpper = false;

  for (let i = 0; i < rows.length; i++) {
    const price = +rows[i].p;
    const time = rows[i].t;

    windowPrices.push(price);
    if (windowPrices.length > WINDOW_SIZE) windowPrices.shift();
    if (windowPrices.length < 2) continue;

    const mean = windowPrices.reduce((a, b) => a + b, 0) / windowPrices.length;
    const variance = windowPrices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / windowPrices.length;
    const std = Math.sqrt(variance);
    const upperBand = mean + K * std;
    const lowerBand = mean - K * std;

    if (time.getTime() < may1) continue;

    const wasBelowLower = belowLower;
    const wasAboveUpper = aboveUpper;
    belowLower = price <= lowerBand;
    aboveUpper = price >= upperBand;

    if (!wasBelowLower && belowLower) {
      buyQueue.push({ price, time });
    }

    if (!wasAboveUpper && aboveUpper && buyQueue.length > 0) {
      const buy = buyQueue.shift()!;
      const entryValue = BTC_QTY * buy.price;
      const exitValue = BTC_QTY * price;
      const makerFee = entryValue * MAKER_FEE_PCT / 100;
      const takerFee = exitValue * TAKER_FEE_PCT / 100;
      const grossPnl = exitValue - entryValue;
      const netPnl = grossPnl - makerFee - takerFee;
      const holdingMinutes = Math.round((time.getTime() - buy.time.getTime()) / 60000);

      tradeList.push({
        symbol: "BTCUSDT",
        side: "buy" as const,
        entryPrice: buy.price,
        exitPrice: price,
        targetPrice: upperBand,
        quantity: BTC_QTY,
        makerFee,
        takerFee,
        withdrawalFee: 0,
        grossPnl,
        netPnl,
        status: "closed" as const,
        enteredAt: buy.time,
        exitedAt: time,
        holdingMinutes: Math.max(1, holdingMinutes),
      });
    }
  }

  buyQueue.forEach((buy) => {
    const lastPrice = rows[rows.length - 1].p;
    const lastTime = rows[rows.length - 1].t;
    const entryValue = BTC_QTY * buy.price;
    const exitValue = BTC_QTY * lastPrice;
    const makerFee = entryValue * MAKER_FEE_PCT / 100;
    const takerFee = exitValue * TAKER_FEE_PCT / 100;
    const grossPnl = exitValue - entryValue;
    const netPnl = grossPnl - makerFee - takerFee;
    const holdingMinutes = Math.round((lastTime.getTime() - buy.time.getTime()) / 60000);

    tradeList.push({
      symbol: "BTCUSDT",
      side: "buy" as const,
      entryPrice: buy.price,
      exitPrice: lastPrice,
      targetPrice: null,
      quantity: BTC_QTY,
      makerFee,
      takerFee,
      withdrawalFee: 0,
      grossPnl,
      netPnl,
      status: "open" as const,
      enteredAt: buy.time,
      exitedAt: lastTime,
      holdingMinutes: Math.max(1, holdingMinutes),
    });
  });

  console.log(`\nClearing old trades...`);
  await db.delete(trades);

  console.log(`Inserting ${tradeList.length} trades...`);
  for (let i = 0; i < tradeList.length; i += 500) {
    const batch = tradeList.slice(i, i + 500);
    await db.insert(trades).values(batch);
  }

  const closedTrades = tradeList.filter(t => t.status === "closed");
  const wins = closedTrades.filter(t => t.netPnl > 0).length;
  const losses = closedTrades.filter(t => t.netPnl < 0).length;
  const totalPnl = closedTrades.reduce((s, t) => s + t.netPnl, 0);
  const totalFees = closedTrades.reduce((s, t) => s + t.makerFee + t.takerFee, 0);
  const avgHold = closedTrades.length > 0
    ? closedTrades.reduce((s, t) => s + t.holdingMinutes, 0) / closedTrades.length
    : 0;

  console.log(`\n=== Results (12h window, every crossing) ===`);
  console.log(`Closed trades: ${closedTrades.length} (${wins}W / ${losses}L)`);
  console.log(`Open positions: ${tradeList.length - closedTrades.length}`);
  console.log(`Win rate: ${closedTrades.length > 0 ? (wins / closedTrades.length * 100).toFixed(1) : 0}%`);
  console.log(`Total P&L: $${totalPnl.toFixed(4)}`);
  console.log(`Total fees: $${totalFees.toFixed(4)}`);
  console.log(`Avg hold: ${avgHold.toFixed(0)} min (${(avgHold / 60).toFixed(1)}h)`);
  console.log(`Unmatched buys: ${buyQueue.length}`);

  process.exit(0);
}

backfill().catch(e => {
  console.error(e);
  process.exit(1);
});
