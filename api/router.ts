import { authRouter } from "./auth-router";
import { marketRouter } from "./marketRouter";
import { bandRouter } from "./bandRouter";
import { tradeRouter } from "./tradeRouter";
import { feeRouter } from "./feeRouter";
import { backtestRouter } from "./backtestRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  market: marketRouter,
  band: bandRouter,
  trade: tradeRouter,
  fee: feeRouter,
  backtest: backtestRouter,
});

export type AppRouter = typeof appRouter;
