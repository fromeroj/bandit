import "dotenv/config";
import { getDb } from "./api/queries/connection";
import { priceSnapshots, trades } from "./db/schema";
import { eq, gte, and, desc } from "drizzle-orm";

const BTC_QTY = 0.00125;
const MAKER_FEE_PCT = 0.1;
const TAKER_FEE_PCT = 0.1;
const WINDOW_SIZE = 48 * 60;
const K = 2.0;
const VOL_SPIKE_RATIO = 2.0;

async function backfill() {
  const db = getDb();

  console.log("Fetching prices with 48h lookback...");
  const lookbackStart = new Date("2026-04-29T00:00:00Z");
  const rows = await db
    .select({
      t: priceSnapshots.closeTime,
      p: priceSnapshots.price,
      v: priceSnapshots.volume,
    })
    .from(priceSnapshots)
    .where(
      and(
        eq(priceSnapshots.symbol, "BTCUSDT"),
        gte(priceSnapshots.closeTime, lookbackStart)
      )
    )
    .orderBy(priceSnapshots.closeTime);

  console.log(`Got ${rows.length} candles (incl. lookback)`);

  const may1 = new Date("2026-05-01T00:00:00Z").getTime();
  const windowPrices: number[] = [];
  const tradeList: any[] = [];
  let inPosition = false;
  let entryPrice = 0;
  let entryTime: Date | null = null;

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

    const ts = time.getTime();
    if (ts < may1) continue;

    if (!inPosition && price <= lowerBand) {
      inPosition = true;
      entryPrice = price;
      entryTime = time;
    } else if (inPosition && price >= upperBand) {
      const exitPrice = price;
      const entryValue = BTC_QTY * entryPrice;
      const exitValue = BTC_QTY * exitPrice;
      const makerFee = entryValue * MAKER_FEE_PCT / 100;
      const takerFee = exitValue * TAKER_FEE_PCT / 100;
      const grossPnl = exitValue - entryValue;
      const netPnl = grossPnl - makerFee - takerFee;
      const holdingMinutes = Math.round((time.getTime() - (entryTime?.getTime() ?? 0)) / 60000);

      tradeList.push({
        symbol: "BTCUSDT",
        side: "buy" as const,
        entryPrice,
        exitPrice,
        targetPrice: upperBand,
        quantity: BTC_QTY,
        makerFee,
        takerFee,
        withdrawalFee: 0,
        grossPnl,
        netPnl,
        status: "closed" as const,
        enteredAt: entryTime!,
        exitedAt: time,
        holdingMinutes: Math.max(1, holdingMinutes),
      });

      inPosition = false;
      entryPrice = 0;
      entryTime = null;
    }
  }

  if (inPosition && entryPrice > 0) {
    const lastPrice = rows[rows.length - 1].p;
    const lastTime = rows[rows.length - 1].t;
    const entryValue = BTC_QTY * entryPrice;
    const exitValue = BTC_QTY * lastPrice;
    const makerFee = entryValue * MAKER_FEE_PCT / 100;
    const takerFee = exitValue * TAKER_FEE_PCT / 100;
    const grossPnl = exitValue - entryValue;
    const netPnl = grossPnl - makerFee - takerFee;
    const holdingMinutes = Math.round((lastTime.getTime() - (entryTime?.getTime() ?? 0)) / 60000);

    tradeList.push({
      symbol: "BTCUSDT",
      side: "buy" as const,
      entryPrice,
      exitPrice: lastPrice,
      targetPrice: null,
      quantity: BTC_QTY,
      makerFee,
      takerFee,
      withdrawalFee: 0,
      grossPnl,
      netPnl,
      status: "open" as const,
      enteredAt: entryTime!,
      exitedAt: lastTime,
      holdingMinutes: Math.max(1, holdingMinutes),
    });
  }

  console.log(`\nClearing old trades...`);
  await db.delete(trades);

  console.log(`Inserting ${tradeList.length} trades...`);
  for (let i = 0; i < tradeList.length; i += 500) {
    const batch = tradeList.slice(i, i + 500);
    await db.insert(trades).values(batch);
  }

  const wins = tradeList.filter(t => t.netPnl > 0).length;
  const losses = tradeList.filter(t => t.netPnl < 0).length;
  const totalPnl = tradeList.reduce((s, t) => s + t.netPnl, 0);
  const avgHold = tradeList.reduce((s, t) => s + (t.holdingMinutes || 0), 0) / tradeList.length;

  console.log(`\n=== Results ===`);
  console.log(`Trades: ${tradeList.length}`);
  console.log(`Wins: ${wins}, Losses: ${losses}`);
  console.log(`Win rate: ${(wins / tradeList.length * 100).toFixed(1)}%`);
  console.log(`Total P&L: $${totalPnl.toFixed(2)}`);
  console.log(`Avg hold: ${avgHold.toFixed(0)} min`);
  console.log(`Open: ${tradeList.filter(t => t.status === 'open').length}`);

  process.exit(0);
}

backfill().catch(e => {
  console.error(e);
  process.exit(1);
});
