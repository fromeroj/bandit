import "dotenv/config";
import { fetchBinanceKlines } from "./api/lib/binance";
import { getDb } from "./api/queries/connection";
import { priceSnapshots } from "./db/schema";
import { eq, gte, lte } from "drizzle-orm";

async function reseed() {
  const startTime = new Date("2026-01-01T00:00:00Z").getTime();
  const endTime = Date.now();
  const batchSize = 1000;
  const interval = "1h";

  console.log(`Fetching BTCUSDT 1h klines from 2026-01-01 to now...`);
  console.log(`Time range: ${new Date(startTime).toISOString()} -> ${new Date(endTime).toISOString()}`);

  const allKlines: any[] = [];
  let cursor = startTime;

  while (cursor < endTime) {
    const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&startTime=${cursor}&limit=${batchSize}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`API error: ${res.status}`);
      break;
    }
    const data: any[][] = await res.json();
    if (data.length === 0) break;

    for (const k of data) {
      allKlines.push({
        symbol: "BTCUSDT",
        price: parseFloat(k[4]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        volume: parseFloat(k[5]),
        closeTime: new Date(k[6]),
      });
    }

    const lastCloseTime = data[data.length - 1][6];
    cursor = lastCloseTime + 1;
    process.stdout.write(`\rFetched ${allKlines.length} klines, latest: ${new Date(lastCloseTime).toISOString()}`);

    if (data.length < batchSize) break;
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nTotal fetched: ${allKlines.length} klines`);

  console.log("Clearing old price_snapshots...");
  await getDb().delete(priceSnapshots);

  console.log("Inserting in batches of 500...");
  for (let i = 0; i < allKlines.length; i += 500) {
    const batch = allKlines.slice(i, i + 500);
    await getDb().insert(priceSnapshots).values(batch);
    process.stdout.write(`\rInserted ${Math.min(i + 500, allKlines.length)}/${allKlines.length}`);
  }

  console.log(`\nDone. ${allKlines.length} rows in price_snapshots.`);
  process.exit(0);
}

reseed().catch((e) => {
  console.error("Reseed error:", e);
  process.exit(1);
});
