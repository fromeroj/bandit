import { getDb } from "../api/queries/connection";
import { priceSnapshots, bandConfigs } from "./schema";
import fs from "fs";
import { parse } from "csv-parse/sync";

async function seed() {
  const db = getDb();

  // Check if we already have data
  const existing = await db.select().from(priceSnapshots).limit(1);
  if (existing.length > 0) {
    console.log("Database already has price data, skipping seed.");
    return;
  }

  // Load from the CSV file if it exists
  const csvPath = "/mnt/agents/output/btc_klines.csv";
  if (fs.existsSync(csvPath)) {
    console.log("Loading historical data from CSV...");
    const content = fs.readFileSync(csvPath, "utf-8");
    const records = parse(content, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    console.log(`Parsed ${records.length} rows from CSV`);

    const snapshots = [];
    for (const row of records) {
      try {
        const closeTime = new Date(row["close_time_formatted"]);
        snapshots.push({
          symbol: "BTCUSDT",
          price: parseFloat(row["close"]),
          open: parseFloat(row["open"]),
          high: parseFloat(row["high"]),
          low: parseFloat(row["low"]),
          volume: parseFloat(row["volume"]),
          closeTime: closeTime,
        });
      } catch {
        // skip bad rows
      }
    }

    console.log(`Prepared ${snapshots.length} snapshots for insert`);

    if (snapshots.length > 0) {
      // Insert in batches of 50 to avoid query size limits
      for (let i = 0; i < snapshots.length; i += 50) {
        const batch = snapshots.slice(i, i + 50);
        await db.insert(priceSnapshots).values(batch);
        process.stdout.write(`\rInserted ${Math.min(i + 50, snapshots.length)}/${snapshots.length}`);
      }
      console.log(`\nSeeded ${snapshots.length} price snapshots.`);
    }
  } else {
    console.log("No CSV file found.");
  }

  // Seed default band config
  const existingConfig = await db.select().from(bandConfigs).limit(1);
  if (existingConfig.length === 0) {
    await db.insert(bandConfigs).values({
      userId: 1,
      symbol: "BTCUSDT",
      windowHours: 48,
      bandMultiplier: 2.0,
      profitMarginPct: 0.15,
      useBnbDiscount: false,
      makerFeePct: 0.1,
      takerFeePct: 0.1,
      withdrawalFeeBtc: 0.0002,
      investmentAmount: 1000,
    });
    console.log("Seeded default band config.");
  }

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
