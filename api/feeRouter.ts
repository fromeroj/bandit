import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { calculateFeeBreakdown } from "./lib/math";
import { getBandConfig } from "./queries/bandConfigs";

export const feeRouter = createRouter({
  calculate: publicQuery
    .input(
      z.object({
        currentPrice: z.number(),
        investmentAmount: z.number().default(1000),
        makerFeePct: z.number().default(0.1),
        takerFeePct: z.number().default(0.1),
        withdrawalFeeBtc: z.number().default(0.0002),
        profitMarginPct: z.number().default(0.15),
      })
    )
    .query(({ input }) => {
      return calculateFeeBreakdown(
        input.currentPrice,
        input.investmentAmount,
        input.makerFeePct,
        input.takerFeePct,
        input.withdrawalFeeBtc,
        input.profitMarginPct
      );
    }),

  withUserConfig: publicQuery
    .input(
      z.object({
        currentPrice: z.number(),
        userId: z.number().default(1),
      })
    )
    .query(async ({ input }) => {
      const config = await getBandConfig(input.userId);
      return calculateFeeBreakdown(
        input.currentPrice,
        config.investmentAmount,
        config.makerFeePct,
        config.takerFeePct,
        config.withdrawalFeeBtc,
        config.profitMarginPct
      );
    }),
});
