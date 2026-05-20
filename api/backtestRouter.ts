import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getAllPrices } from "./queries/prices";
import { getBandConfig } from "./queries/bandConfigs";
import { runBacktest } from "./lib/math";

export const backtestRouter = createRouter({
  run: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        userId: z.number().default(1),
        windowHours: z.number().optional(),
        bandMultiplier: z.number().optional(),
        profitMarginPct: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const config = await getBandConfig(input.userId, input.symbol);

      const prices = await getAllPrices(input.symbol);
      if (prices.length < config.windowHours + 10) {
        return {
          trades: [],
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          breakevenTrades: 0,
          winRatePct: 0,
          totalGrossProfit: 0,
          totalFees: 0,
          totalNetProfit: 0,
          avgHoldingMinutes: 0,
          avgProfitPerTrade: 0,
          maxDrawdownPct: 0,
          sharpeRatio: 0,
          profitFactor: 0,
          message: "Insufficient data for backtest",
        };
      }

      const formattedPrices = prices.map((p) => ({
        close: p.price,
        closeTime: p.closeTime,
      }));

      const result = runBacktest(
        formattedPrices,
        input.windowHours ?? config.windowHours,
        input.bandMultiplier ?? config.bandMultiplier,
        config.makerFeePct,
        config.takerFeePct,
        config.withdrawalFeeBtc,
        input.profitMarginPct ?? config.profitMarginPct,
        config.investmentAmount
      );

      return {
        ...result,
        trades: result.trades.slice(0, 100), // Limit to 100 trades for response size
      };
    }),

  gridSearch: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        userId: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const config = await getBandConfig(input.userId, input.symbol);
      const prices = await getAllPrices(input.symbol);

      if (prices.length < 100) {
        return { grid: [], bestParams: null, message: "Insufficient data" };
      }

      const formattedPrices = prices.map((p) => ({
        close: p.price,
        closeTime: p.closeTime,
      }));

      const windowOptions = [12, 24, 48, 72, 96];
      const kOptions = [1.0, 1.5, 2.0, 2.5, 3.0];

      const grid: {
        windowHours: number;
        bandMultiplier: number;
        netProfit: number;
        winRate: number;
        totalTrades: number;
        sharpeRatio: number;
      }[] = [];

      let bestProfit = -Infinity;
      let bestParams = null as {
        windowHours: number;
        bandMultiplier: number;
      } | null;

      for (const windowHours of windowOptions) {
        for (const k of kOptions) {
          if (formattedPrices.length < windowHours + 5) continue;

          const result = runBacktest(
            formattedPrices,
            windowHours,
            k,
            config.makerFeePct,
            config.takerFeePct,
            config.withdrawalFeeBtc,
            config.profitMarginPct,
            config.investmentAmount
          );

          const entry = {
            windowHours,
            bandMultiplier: k,
            netProfit: result.totalNetProfit,
            winRate: result.winRatePct,
            totalTrades: result.totalTrades,
            sharpeRatio: result.sharpeRatio,
          };

          grid.push(entry);

          if (result.totalNetProfit > bestProfit) {
            bestProfit = result.totalNetProfit;
            bestParams = { windowHours, bandMultiplier: k };
          }
        }
      }

      return { grid, bestParams };
    }),
});
