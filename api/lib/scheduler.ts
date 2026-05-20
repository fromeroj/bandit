import { fetchBinanceKlines, fetchBinanceTicker } from "./binance";
import { getLatestPrice, savePriceSnapshots } from "../queries/prices";
import { getDb } from "../queries/connection";
import { priceSnapshots } from "@db/schema";
import { gte, eq, and } from "drizzle-orm";

let tickerInterval: ReturnType<typeof setInterval> | null = null;
let klineInterval: ReturnType<typeof setInterval> | null = null;

async function syncLatestKline() {
  try {
    const klines = await fetchBinanceKlines("BTCUSDT", "1h", 2);
    if (klines.length === 0) return;

    const latest = await getLatestPrice("BTCUSDT");
    const latestTime = latest ? new Date(latest.closeTime).getTime() : 0;

    const newKlines = klines.filter((k) => k.closeTime > latestTime);
    if (newKlines.length === 0) return;

    const snapshots = newKlines.map((k) => ({
      symbol: "BTCUSDT",
      price: k.close,
      open: k.open,
      high: k.high,
      low: k.low,
      volume: k.volume,
      closeTime: new Date(k.closeTime),
    }));

    await savePriceSnapshots(snapshots);
    console.log(`[sync] Inserted ${snapshots.length} new kline(s), latest closeTime: ${new Date(newKlines[newKlines.length - 1].closeTime).toISOString()}`);
  } catch (error) {
    console.error("[sync] Kline sync error:", error);
  }
}

async function syncLatestTicker() {
  try {
    const ticker = await fetchBinanceTicker("BTCUSDT");
    if (!ticker) return;

    const oneMinAgo = new Date(Date.now() - 60 * 1000);

    const recent = await getDb()
      .select()
      .from(priceSnapshots)
      .where(
        and(
          eq(priceSnapshots.symbol, "BTCUSDT"),
          gte(priceSnapshots.closeTime, oneMinAgo)
        )
      )
      .limit(1);

    if (recent.length > 0) return;

    await getDb().insert(priceSnapshots).values({
      symbol: "BTCUSDT",
      price: ticker.price,
      high: ticker.high,
      low: ticker.low,
      volume: ticker.volume,
      closeTime: new Date(),
    });
    console.log(`[sync] Ticker snapshot: $${ticker.price.toFixed(2)}`);
  } catch (error) {
    console.error("[sync] Ticker sync error:", error);
  }
}

export function startSyncScheduler() {
  console.log("[sync] Starting Binance price sync scheduler...");

  syncLatestKline();

  klineInterval = setInterval(syncLatestKline, 60 * 1000);
  tickerInterval = setInterval(syncLatestTicker, 20 * 1000);
}

export function stopSyncScheduler() {
  if (klineInterval) clearInterval(klineInterval);
  if (tickerInterval) clearInterval(tickerInterval);
}
