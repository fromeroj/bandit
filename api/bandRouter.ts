import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getBandConfig, upsertBandConfig } from "./queries/bandConfigs";
import { getPriceHistory } from "./queries/prices";
import { calculateBands, calculateFeeBreakdown, calculateRollingBands } from "./lib/math";

export const bandRouter = createRouter({
  getConfig: publicQuery
    .input(z.object({ userId: z.number().default(1) }).optional())
    .query(async ({ input }) => {
      const config = await getBandConfig(input?.userId || 1);
      return config;
    }),

  updateConfig: publicQuery
    .input(
      z.object({
        userId: z.number().default(1),
        windowHours: z.number().min(6).max(168).optional(),
        bandMultiplier: z.number().min(0.5).max(5).optional(),
        profitMarginPct: z.number().min(0).max(5).optional(),
        useBnbDiscount: z.boolean().optional(),
        makerFeePct: z.number().min(0).max(1).optional(),
        takerFeePct: z.number().min(0).max(1).optional(),
        withdrawalFeeBtc: z.number().min(0).optional(),
        investmentAmount: z.number().min(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...data } = input;
      const numericUserId = userId || 1;

      // Apply BNB discount if enabled
      if (data.useBnbDiscount) {
        data.makerFeePct = 0.075;
        data.takerFeePct = 0.075;
      }

      const id = await upsertBandConfig(numericUserId, data);
      return { id, success: true };
    }),

  calculate: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        hours: z.number().default(48),
        k: z.number().default(2.0),
      })
    )
    .query(async ({ input }) => {
      const prices = await getPriceHistory(input.symbol, input.hours);
      if (prices.length < 2) {
        return {
          mean: 0,
          std: 0,
          upperBand: 0,
          lowerBand: 0,
          bandWidth: 0,
          bandWidthPct: 0,
          signal: "hold" as const,
          currentPrice: 0,
          dataPoints: 0,
        };
      }

      const currentPrice = prices[prices.length - 1].price;
      const priceValues = prices.map((p) => p.price);
      const bands = calculateBands(priceValues, currentPrice, input.k);

      return {
        ...bands,
        currentPrice,
        dataPoints: prices.length,
      };
    }),

  fullState: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        userId: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const config = await getBandConfig(input.userId, input.symbol);
      const prices = await getPriceHistory(input.symbol, config.windowHours);

      if (prices.length < 2) {
        return {
          config,
          bands: {
            mean: 0, std: 0, upperBand: 0, lowerBand: 0,
            bandWidth: 0, bandWidthPct: 0, signal: "hold" as const,
            currentPrice: 0, dataPoints: 0,
          },
          fees: {
            makerFeePct: config.makerFeePct,
            takerFeePct: config.takerFeePct,
            withdrawalFeeBtc: config.withdrawalFeeBtc,
            withdrawalFeeUsd: 0,
            makerFeeUsd: 0, takerFeeUsd: 0, totalFeesUsd: 0,
            minSpreadUsd: 0, minSpreadPct: 0,
            targetGainPct: 0, targetGainUsd: 0, targetSellPrice: 0,
          },
          recentPrices: [],
        };
      }

      const currentPrice = prices[prices.length - 1].price;
      const priceValues = prices.map((p) => p.price);
      const bands = calculateBands(priceValues, currentPrice, config.bandMultiplier);

      const fees = calculateFeeBreakdown(
        currentPrice,
        config.investmentAmount,
        config.makerFeePct,
        config.takerFeePct,
        config.withdrawalFeeBtc,
        config.profitMarginPct
      );

      const rollingBands = calculateRollingBands(
        prices,
        config.windowHours,
        config.bandMultiplier
      );

      const recentPrices = prices.slice(-100).map((p) => {
        const key = p.closeTime.toISOString();
        const rb = rollingBands.get(key);
        return {
          time: key,
          price: p.price,
          upperBand: rb?.upperBand ?? bands.upperBand,
          lowerBand: rb?.lowerBand ?? bands.lowerBand,
          mean: rb?.mean ?? bands.mean,
        };
      });

      return { config, bands: { ...bands, currentPrice, dataPoints: prices.length }, fees, recentPrices };
    }),
});
