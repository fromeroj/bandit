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
        // Dynamically import to avoid type issues
        const dsModule = await import("./lib/data-source");
        const result = await dsModule.get_data_source("binance_crypto", "binance_crypto_klines", {
          symbol: input.symbol,
          interval: input.interval,
          limit: input.limit,
          file_path: `/tmp/klines_${Date.now()}.csv`,
        });

        if (result && typeof result === "object" && "data" in result) {
          const data = (result as any).data;
          if (Array.isArray(data) && data.length > 0) {
            const snapshots = data.map((c: any) => ({
              symbol: input.symbol,
              price: parseFloat(c.close),
              open: parseFloat(c.open),
              high: parseFloat(c.high),
              low: parseFloat(c.low),
              volume: parseFloat(c.volume),
              closeTime: new Date(parseInt(c.close_time)),
            }));
            await savePriceSnapshots(snapshots);
            return { synced: snapshots.length };
          }
        }
        return { synced: 0 };
      } catch (error) {
        console.error("Failed to sync prices:", error);
        return { synced: 0, error: String(error) };
      }
    }),

  syncFromTicker: publicQuery
    .input(z.object({ symbol: z.string().default("BTCUSDT") }))
    .query(async ({ input }) => {
      try {
        const dsModule = await import("./lib/data-source");
        const result = await dsModule.get_data_source("binance_crypto", "binance_crypto_price", {
          symbol: input.symbol,
          file_path: `/tmp/price_${Date.now()}.csv`,
        });

        if (result && typeof result === "object" && "data" in result) {
          const data = (result as any).data;
          if (Array.isArray(data) && data.length > 0) {
            const ticker = data[0];
            await getDb().insert(priceSnapshots).values({
              symbol: input.symbol,
              price: parseFloat(ticker.price),
              high: parseFloat(ticker.high),
              low: parseFloat(ticker.low),
              volume: parseFloat(ticker.volume),
              closeTime: new Date(),
            });
            return { price: parseFloat(ticker.price), synced: true };
          }
        }
        return { synced: false };
      } catch (error) {
        console.error("Failed to sync ticker:", error);
        return { synced: false, error: String(error) };
      }
    }),
});
