import "dotenv/config";
import { getDb } from "./api/queries/connection";
import { priceSnapshots } from "./db/schema";
import { eq, gte, and } from "drizzle-orm";

async function count() {
  const db = getDb();
  const lookbackStart = new Date("2026-04-30T12:00:00Z");
  const may1 = new Date("2026-05-01T00:00:00Z").getTime();
  const WINDOW = 12 * 60;
  const K = 2.0;

  const rows = await db
    .select({ t: priceSnapshots.closeTime, p: priceSnapshots.price })
    .from(priceSnapshots)
    .where(and(eq(priceSnapshots.symbol, "BTCUSDT"), gte(priceSnapshots.closeTime, lookbackStart)))
    .orderBy(priceSnapshots.closeTime);

  const wp: number[] = [];
  let lowerCrossings = 0;
  let upperCrossings = 0;
  let wasBelow = false;
  let wasAbove = false;

  for (let i = 0; i < rows.length; i++) {
    const price = +rows[i].p;
    const ts = rows[i].t.getTime();
    wp.push(price);
    if (wp.length > WINDOW) wp.shift();
    if (wp.length < 2 || ts < may1) { wasBelow = false; wasAbove = false; continue; }

    const mean = wp.reduce((a, b) => a + b, 0) / wp.length;
    const std = Math.sqrt(wp.reduce((s, p) => s + (p - mean) ** 2, 0) / wp.length);
    const upper = mean + K * std;
    const lower = mean - K * std;

    const nowBelow = price <= lower;
    const nowAbove = price >= upper;

    if (!wasBelow && nowBelow) lowerCrossings++;
    if (!wasAbove && nowAbove) upperCrossings++;

    wasBelow = nowBelow;
    wasAbove = nowAbove;
  }

  console.log(`Lower band crossings (BUY):  ${lowerCrossings}`);
  console.log(`Upper band crossings (SELL): ${upperCrossings}`);
  console.log(`Total:                       ${lowerCrossings + upperCrossings}`);
  process.exit(0);
}

count().catch(e => { console.error(e); process.exit(1); });
