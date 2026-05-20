import { getDb } from "./connection";
import { bandConfigs } from "@db/schema";
import { eq } from "drizzle-orm";

export async function getBandConfig(userId: number = 1, symbol: string = "BTCUSDT") {
  const config = await getDb().query.bandConfigs.findFirst({
    where: eq(bandConfigs.userId, userId),
  });

  if (!config) {
    // Return default config
    return {
      id: 0,
      userId,
      symbol,
      windowHours: 48,
      bandMultiplier: 2.0,
      profitMarginPct: 0.15,
      useBnbDiscount: false,
      makerFeePct: 0.1,
      takerFeePct: 0.1,
      withdrawalFeeBtc: 0.0002,
      investmentAmount: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return config;
}

export async function upsertBandConfig(
  userId: number,
  data: {
    symbol?: string;
    windowHours?: number;
    bandMultiplier?: number;
    profitMarginPct?: number;
    useBnbDiscount?: boolean;
    makerFeePct?: number;
    takerFeePct?: number;
    withdrawalFeeBtc?: number;
    investmentAmount?: number;
  }
) {
  const existing = await getDb().query.bandConfigs.findFirst({
    where: eq(bandConfigs.userId, userId),
  });

  if (existing) {
    await getDb()
      .update(bandConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bandConfigs.id, existing.id));
    return existing.id;
  } else {
    const result = await getDb()
      .insert(bandConfigs)
      .values({
        userId,
        symbol: data.symbol || "BTCUSDT",
        windowHours: data.windowHours ?? 48,
        bandMultiplier: data.bandMultiplier ?? 2.0,
        profitMarginPct: data.profitMarginPct ?? 0.15,
        useBnbDiscount: data.useBnbDiscount ?? false,
        makerFeePct: data.makerFeePct ?? 0.1,
        takerFeePct: data.takerFeePct ?? 0.1,
        withdrawalFeeBtc: data.withdrawalFeeBtc ?? 0.0002,
        investmentAmount: data.investmentAmount ?? 1000,
      })
      .$returningId();
    return result[0]?.id;
  }
}
