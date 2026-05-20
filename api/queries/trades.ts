import { getDb } from "./connection";
import { trades } from "@db/schema";
import { desc, eq, and } from "drizzle-orm";

export async function getTrades(symbol: string = "BTCUSDT", limit: number = 50) {
  return getDb()
    .select()
    .from(trades)
    .where(eq(trades.symbol, symbol))
    .orderBy(desc(trades.enteredAt))
    .limit(limit);
}

export async function getOpenTrade(symbol: string = "BTCUSDT") {
  return getDb().query.trades.findFirst({
    where: and(eq(trades.symbol, symbol), eq(trades.status, "open")),
  });
}

export async function createTrade(data: {
  symbol: string;
  side: "buy" | "sell";
  entryPrice: number;
  targetPrice?: number;
  quantity: number;
  makerFee: number;
  status?: "open" | "closed" | "cancelled";
}) {
  const result = await getDb()
    .insert(trades)
    .values({
      ...data,
      status: data.status || "open",
    })
    .$returningId();
  return result[0]?.id;
}

export async function closeTrade(
  tradeId: number,
  data: {
    exitPrice: number;
    takerFee: number;
    withdrawalFee: number;
    grossPnl: number;
    netPnl: number;
    holdingMinutes: number;
  }
) {
  await getDb()
    .update(trades)
    .set({
      ...data,
      status: "closed",
      exitedAt: new Date(),
      side: "sell",
    })
    .where(eq(trades.id, tradeId));
}

export async function getTradeStats(symbol: string = "BTCUSDT") {
  const allTrades = await getDb()
    .select()
    .from(trades)
    .where(eq(trades.symbol, symbol))
    .orderBy(desc(trades.enteredAt));

  const closed = allTrades.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => (t.netPnl || 0) > 0);
  const losses = closed.filter((t) => (t.netPnl || 0) < 0);

  return {
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: closed.length - wins.length - losses.length,
    totalNetPnl: closed.reduce((s, t) => s + (t.netPnl || 0), 0),
    totalFees: closed.reduce(
      (s, t) => s + (t.makerFee || 0) + (t.takerFee || 0) + (t.withdrawalFee || 0),
      0
    ),
    avgHoldingMinutes:
      closed.length > 0
        ? closed.reduce((s, t) => s + (t.holdingMinutes || 0), 0) / closed.length
        : 0,
    winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : 0,
  };
}
