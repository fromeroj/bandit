import "dotenv/config";
import { getDb } from "./api/queries/connection";
import { priceSnapshots, trades } from "./db/schema";
import { eq, gte, and } from "drizzle-orm";

const UNIT = 0.00125;
const MAKER_FEE_PCT = 0.1;
const TAKER_FEE_PCT = 0.1;
const WINDOW = 12 * 60;
const K = 2.0;

async function simulate() {
  const db = getDb();
  const lookbackStart = new Date("2026-04-30T12:00:00Z");
  const may1 = new Date("2026-05-01T00:00:00Z").getTime();

  const rows = await db
    .select({ t: priceSnapshots.closeTime, p: priceSnapshots.price })
    .from(priceSnapshots)
    .where(and(eq(priceSnapshots.symbol, "BTCUSDT"), gte(priceSnapshots.closeTime, lookbackStart)))
    .orderBy(priceSnapshots.closeTime);

  console.log(`Got ${rows.length} candles`);

  const wp: number[] = [];
  let btcUnits = 100;
  let usdt = 5000;
  let pending = 0;
  let wasBelow = false;
  let wasAbove = false;
  const tradeList: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const price = +rows[i].p;
    const time = rows[i].t;
    if (time.getTime() < may1) { wasBelow = false; wasAbove = false; continue; }

    wp.push(price);
    if (wp.length > WINDOW) wp.shift();
    if (wp.length < 2) continue;

    const mean = wp.reduce((a, b) => a + b, 0) / wp.length;
    const std = Math.sqrt(wp.reduce((s, p) => s + (p - mean) ** 2, 0) / wp.length);
    const upper = mean + K * std;
    const lower = mean - K * std;

    const nowBelow = price <= lower;
    const nowAbove = price >= upper;

    if (!wasBelow && nowBelow) {
      const toCover = Math.abs(Math.min(pending, 0));
      const toBuy = toCover + 1;
      const cost = toBuy * UNIT * price;
      const fee = cost * MAKER_FEE_PCT / 100;

      if (usdt >= cost + fee) {
        usdt -= cost + fee;
        btcUnits += toBuy;
        pending = (pending < 0 ? 0 : pending) + 1;
        tradeList.push({
          symbol: "BTCUSDT", side: "buy" as const,
          entryPrice: price, exitPrice: null, targetPrice: null,
          quantity: toBuy * UNIT, makerFee: fee, takerFee: 0, withdrawalFee: 0,
          grossPnl: null, netPnl: null, status: "open" as const,
          enteredAt: time, exitedAt: time, holdingMinutes: 0,
        });
      }
    }

    if (!wasAbove && nowAbove) {
      const toClose = Math.max(pending, 0);
      const toSell = toClose + 1;
      const canSell = Math.min(toSell, btcUnits);

      if (canSell > 0) {
        const revenue = canSell * UNIT * price;
        const fee = revenue * TAKER_FEE_PCT / 100;
        usdt += revenue - fee;
        btcUnits -= canSell;
        pending = (pending > 0 ? 0 : pending) - 1;

        const lastBuy = tradeList.filter(t => t.side === "buy" && t.status === "open").pop();
        if (lastBuy) {
          const entryCost = canSell * UNIT * lastBuy.entryPrice;
          const grossPnl = revenue - entryCost;
          const totalFees = fee + (lastBuy.makerFee || 0);
          const netPnl = grossPnl - totalFees;
          const holdMin = Math.round((time.getTime() - new Date(lastBuy.enteredAt).getTime()) / 60000);
          tradeList.push({
            symbol: "BTCUSDT", side: "sell" as const,
            entryPrice: lastBuy.entryPrice, exitPrice: price, targetPrice: upper,
            quantity: canSell * UNIT, makerFee: lastBuy.makerFee || 0, takerFee: fee, withdrawalFee: 0,
            grossPnl, netPnl, status: "closed" as const,
            enteredAt: lastBuy.enteredAt, exitedAt: time, holdingMinutes: Math.max(1, holdMin),
          });
          lastBuy.status = "closed";
          lastBuy.exitPrice = price;
          lastBuy.netPnl = netPnl;
        }
      }
    }

    wasBelow = nowBelow;
    wasAbove = nowAbove;
  }

  console.log(`\nClearing old trades...`);
  await db.delete(trades);
  console.log(`Inserting ${tradeList.length} trades...`);
  for (let i = 0; i < tradeList.length; i += 500) {
    await db.insert(trades).values(tradeList.slice(i, i + 500));
  }

  const lastPrice = +rows[rows.length - 1].p;
  const closedTrades = tradeList.filter(t => t.status === "closed" && t.side === "sell");
  const wins = closedTrades.filter(t => t.netPnl > 0).length;
  const losses = closedTrades.filter(t => t.netPnl < 0).length;
  const totalPnl = closedTrades.reduce((s, t) => s + (t.netPnl || 0), 0);
  const totalFees = closedTrades.reduce((s, t) => s + (t.makerFee || 0) + (t.takerFee || 0), 0);
  const btcValue = btcUnits * UNIT * lastPrice;
  const totalValue = btcValue + usdt;
  const startValue = 100 * UNIT * +rows.find(r => r.t.getTime() >= may1)!.p + 5000;

  console.log(`\n========== RESULTS ==========`);
  console.log(`Starting: 100 BTC units + $5,000 USDT = $${startValue.toFixed(2)}`);
  console.log(`Ending:   ${btcUnits} BTC units ($${btcValue.toFixed(2)}) + $${usdt.toFixed(2)} USDT = $${totalValue.toFixed(2)}`);
  console.log(`P&L: $${(totalValue - startValue).toFixed(2)} (${((totalValue - startValue) / startValue * 100).toFixed(2)}%)`);
  console.log(`\nClosed trades: ${closedTrades.length} (${wins}W / ${losses}L)`);
  console.log(`Win rate: ${closedTrades.length > 0 ? (wins / closedTrades.length * 100).toFixed(1) : 0}%`);
  console.log(`Total fees: $${totalFees.toFixed(4)}`);
  console.log(`BTC reserve: ${btcUnits} units (started 100)`);
  console.log(`Pending position: ${pending > 0 ? '+' : ''}${pending} units`);

  process.exit(0);
}

simulate().catch(e => { console.error(e); process.exit(1); });
