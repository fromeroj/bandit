import "dotenv/config";
import { getDb } from "./api/queries/connection";
import { priceSnapshots } from "./db/schema";

async function reseed() {
  const startTime = new Date("2026-01-01T00:00:00Z").getTime();
  const endTime = Date.now();
  const batchSize = 1000;
  const interval = "1m";

  console.log(`Fetching BTCUSDT ${interval} klines from 2026-01-01 to now...`);
  console.log(`Time range: ${new Date(startTime).toISOString()} -> ${new Date(endTime).toISOString()}`);

  console.log("Clearing old price_snapshots...");
  await getDb().delete(priceSnapshots);

  let totalInserted = 0;
  let cursor = startTime;
  let batchBuffer: any[] = [];

  while (cursor < endTime) {
    const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&startTime=${cursor}&limit=${batchSize}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`\nAPI error: ${res.status}, retrying in 5s...`);
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    const data: any[][] = await res.json();
    if (data.length === 0) break;

    for (const k of data) {
      batchBuffer.push({
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

    if (batchBuffer.length >= 2000) {
      await getDb().insert(priceSnapshots).values(batchBuffer);
      totalInserted += batchBuffer.length;
      process.stdout.write(`\rInserted ${totalInserted} rows, latest: ${new Date(lastCloseTime).toISOString()}`);
      batchBuffer = [];
    }

    if (data.length < batchSize) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (batchBuffer.length > 0) {
    await getDb().insert(priceSnapshots).values(batchBuffer);
    totalInserted += batchBuffer.length;
  }

  console.log(`\nDone. ${totalInserted} rows in price_snapshots.`);
  process.exit(0);
}

reseed().catch((e) => {
  console.error("Reseed error:", e);
  process.exit(1);
});
