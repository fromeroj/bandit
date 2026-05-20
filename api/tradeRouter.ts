import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  getTrades,
  getOpenTrade,
  createTrade,
  closeTrade,
  getTradeStats,
} from "./queries/trades";

export const tradeRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          symbol: z.string().default("BTCUSDT"),
          limit: z.number().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const symbol = input?.symbol || "BTCUSDT";
      const limit = input?.limit || 50;
      return getTrades(symbol, limit);
    }),

  openPosition: publicQuery
    .input(
      z.object({
        symbol: z.string().default("BTCUSDT"),
        entryPrice: z.number(),
        quantity: z.number(),
        targetPrice: z.number().optional(),
        makerFee: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const tradeId = await createTrade({
        symbol: input.symbol,
        side: "buy",
        entryPrice: input.entryPrice,
        targetPrice: input.targetPrice,
        quantity: input.quantity,
        makerFee: input.makerFee,
        status: "open",
      });
      return { tradeId, success: true };
    }),

  closePosition: publicQuery
    .input(
      z.object({
        tradeId: z.number(),
        exitPrice: z.number(),
        takerFee: z.number(),
        withdrawalFee: z.number(),
        grossPnl: z.number(),
        netPnl: z.number(),
        holdingMinutes: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await closeTrade(input.tradeId, {
        exitPrice: input.exitPrice,
        takerFee: input.takerFee,
        withdrawalFee: input.withdrawalFee,
        grossPnl: input.grossPnl,
        netPnl: input.netPnl,
        holdingMinutes: input.holdingMinutes,
      });
      return { success: true };
    }),

  getOpen: publicQuery
    .input(z.object({ symbol: z.string().default("BTCUSDT") }))
    .query(async ({ input }) => {
      return getOpenTrade(input.symbol);
    }),

  stats: publicQuery
    .input(z.object({ symbol: z.string().default("BTCUSDT") }))
    .query(async ({ input }) => {
      return getTradeStats(input.symbol);
    }),

  simulate: publicQuery
    .input(
      z.object({
        entryPrice: z.number(),
        exitPrice: z.number(),
        investmentAmount: z.number().default(1000),
        makerFeePct: z.number().default(0.1),
        takerFeePct: z.number().default(0.1),
        withdrawalFeeBtc: z.number().default(0.0002),
      })
    )
    .query(({ input }) => {
      const makerFee = (input.investmentAmount * input.makerFeePct) / 100;
      const takerFee = (input.investmentAmount * input.takerFeePct) / 100;
      const withdrawalFee = input.withdrawalFeeBtc * input.exitPrice;
      const grossPnl =
        ((input.exitPrice - input.entryPrice) / input.entryPrice) *
        input.investmentAmount;
      const totalFees = makerFee + takerFee + withdrawalFee;
      const netPnl = grossPnl - totalFees;

      return {
        entryPrice: input.entryPrice,
        exitPrice: input.exitPrice,
        grossPnl,
        makerFee,
        takerFee,
        withdrawalFee,
        totalFees,
        netPnl,
        roiPct: (netPnl / input.investmentAmount) * 100,
      };
    }),
});
