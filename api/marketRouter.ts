import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  getLatestPrice,
  getPriceHistory,
  savePriceSnapshots,
  getAllPrices,
} from "./queries/prices";
import { getDb } from "./queries/connection";
import { priceSnapshots } from "@db/schema";
import { fetchBinanceKlines, fetchBinanceTicker } from "./lib/binance";

export const marketRouter = createRouter({
  currentPrice: publicQuery
    .input(z.object({ symbol: z.string().default("BTCUSDT") }).optional())
    .query(async ({ input }) => {
      const symbol = input?.symbol || "BTCUSDT";
      const latest = await getLatestPrice(symbol);
      if (!latest) {
        return { price: 0, timestamp: new Date().toISOString() };
      }
      return {
        price: latest.price,
        open: latest.open,
        high: latest.high,
        low: latest.low,
        volume: latest.volume,
        timestamp: latest.closeTime.toISOString(),
      };
    }),

  history: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        hours: z.number().default(48),
      })
    )
    .query(async ({ input }) => {
      const prices = await getPriceHistory(input.symbol, input.hours);
      return prices.map((p) => ({
        time: p.closeTime.toISOString(),
        price: p.price,
        open: p.open,
        high: p.high,
        low: p.low,
        volume: p.volume,
      }));
    }),

  allPrices: publicQuery
    .input(z.object({ symbol: z.string().default("BTCUSDT") }).optional())
    .query(async ({ input }) => {
      const symbol = input?.symbol || "BTCUSDT";
      const prices = await getAllPrices(symbol);
      return prices.map((p) => ({
        time: p.closeTime.toISOString(),
        price: p.price,
        open: p.open,
        high: p.high,
        low: p.low,
        volume: p.volume,
      }));
    }),

  syncPrices: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        interval: z.string().default("1h"),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const klines = await fetchBinanceKlines(input.symbol, input.interval, input.limit);
        if (klines.length === 0) return { synced: 0 };

        const snapshots = klines.map((k) => ({
          symbol: input.symbol,
          price: k.close,
          open: k.open,
          high: k.high,
          low: k.low,
          volume: k.volume,
          closeTime: new Date(k.closeTime),
        }));
        await savePriceSnapshots(snapshots);
        return { synced: snapshots.length };
      } catch (error) {
        console.error("Failed to sync prices:", error);
        return { synced: 0, error: String(error) };
      }
    }),

  syncFromTicker: publicQuery
    .input(z.object({ symbol: z.string().default("BTCUSDT") }))
    .query(async ({ input }) => {
      try {
        const ticker = await fetchBinanceTicker(input.symbol);
        if (!ticker) return { synced: false };

        await getDb().insert(priceSnapshots).values({
          symbol: input.symbol,
          price: ticker.price,
          high: ticker.high,
          low: ticker.low,
          volume: ticker.volume,
          closeTime: new Date(),
        });
        return { price: ticker.price, synced: true };
      } catch (error) {
        console.error("Failed to sync ticker:", error);
        return { synced: false, error: String(error) };
      }
    }),

  exportRange: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const symbol = input.symbol || "BTCUSDT";
      let query = getDb()
        .select({
          t: priceSnapshots.closeTime,
          p: priceSnapshots.price,
          o: priceSnapshots.open,
          h: priceSnapshots.high,
          l: priceSnapshots.low,
          v: priceSnapshots.volume,
        })
        .from(priceSnapshots)
        .where(eq(priceSnapshots.symbol, symbol))
        .orderBy(priceSnapshots.closeTime);

      const rows = await query;
      return rows.map((r) => ({
        t: r.t.getTime(),
        p: r.p,
        o: r.o,
        h: r.h,
        l: r.l,
        v: r.v,
      }));
    }),
});
