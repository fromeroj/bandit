import { getDb } from "./connection";
import { performanceLogs } from "@db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function getPerformanceLogs(
  symbol: string = "BTCUSDT",
  days: number = 30
) {
  return getDb()
    .select()
    .from(performanceLogs)
    .where(eq(performanceLogs.symbol, symbol))
    .orderBy(desc(performanceLogs.date))
    .limit(days);
}

export async function savePerformanceLog(data: {
  symbol: string;
  date: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalFees: number;
  grossProfit: number;
  netProfit: number;
  avgHoldingMinutes: number;
  maxDrawdownPct: number;
  winRatePct: number;
}) {
  await getDb()
    .insert(performanceLogs)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        ...data,
        createdAt: new Date(),
      },
    });
}
