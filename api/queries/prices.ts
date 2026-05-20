import { getDb } from "./connection";
import { priceSnapshots } from "@db/schema";
import { desc, eq, gte, and } from "drizzle-orm";

export async function getLatestPrice(symbol: string = "BTCUSDT") {
  return getDb().query.priceSnapshots.findFirst({
    where: eq(priceSnapshots.symbol, symbol),
    orderBy: [desc(priceSnapshots.closeTime)],
  });
}

export async function getPriceHistory(
  symbol: string = "BTCUSDT",
  hours: number = 48
) {
  const cutoff = new Date(Date.now() - hours * 3600 * 1000);
  return getDb()
    .select()
    .from(priceSnapshots)
    .where(
      and(
        eq(priceSnapshots.symbol, symbol),
        gte(priceSnapshots.closeTime, cutoff)
      )
    )
    .orderBy(priceSnapshots.closeTime);
}

export async function getAllPrices(symbol: string = "BTCUSDT") {
  return getDb()
    .select()
    .from(priceSnapshots)
    .where(eq(priceSnapshots.symbol, symbol))
    .orderBy(priceSnapshots.closeTime);
}

export async function savePriceSnapshot(data: {
  symbol: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  closeTime: Date;
}) {
  await getDb().insert(priceSnapshots).values(data);
}

export async function savePriceSnapshots(
  snapshots: {
    symbol: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
    closeTime: Date;
  }[]
) {
  if (snapshots.length === 0) return;
  await getDb().insert(priceSnapshots).values(snapshots);
}

export async function deleteOldPrices(hours: number = 720) {
  const cutoff = new Date(Date.now() - hours * 3600 * 1000);
  await getDb()
    .delete(priceSnapshots)
    .where(gte(priceSnapshots.closeTime, cutoff));
}
