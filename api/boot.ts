import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { startSyncScheduler } from "./lib/scheduler";
import { getDb } from "./queries/connection";
import { priceSnapshots } from "@db/schema";
import { eq, gte, and, desc, sql as sqlOrm } from "drizzle-orm";

const WINDOW_SIZE = 12 * 60;
const VOL_WINDOW = 12 * 60;
const K = 2.0;

function computeRollingBands(rows: { t: number; p: number; v: number }[]): number[][] {
  const windowPrices: number[] = [];
  const windowVols: number[] = [];
  const result: number[][] = [];

  for (let i = 0; i < rows.length; i++) {
    windowPrices.push(rows[i].p);
    windowVols.push(rows[i].v);
    if (windowPrices.length > WINDOW_SIZE) windowPrices.shift();
    if (windowVols.length > VOL_WINDOW) windowVols.shift();

    let mean: number;
    let upperBand: number;
    let lowerBand: number;

    if (windowPrices.length >= 2) {
      mean = windowPrices.reduce((a, b) => a + b, 0) / windowPrices.length;
      const variance =
        windowPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
        windowPrices.length;
      const std = Math.sqrt(variance);
      upperBand = mean + K * std;
      lowerBand = mean - K * std;
    } else {
      mean = rows[i].p;
      upperBand = rows[i].p;
      lowerBand = rows[i].p;
    }

    const avgVol = windowVols.length > 0 ? windowVols.reduce((a, b) => a + b, 0) / windowVols.length : 0;

    result.push([rows[i].t, rows[i].p, mean, upperBand, lowerBand, rows[i].v, avgVol]);
  }

  return result;
}

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.get("/api/sync/prices", async (c) => {
  const after = parseInt(c.req.query("after") || "0");
  const symbol = c.req.query("symbol") || "BTCUSDT";

  if (after === 0) {
    const rows = await getDb()
      .select({
        t: priceSnapshots.closeTime,
        p: priceSnapshots.price,
        v: priceSnapshots.volume,
      })
      .from(priceSnapshots)
      .where(eq(priceSnapshots.symbol, symbol))
      .orderBy(priceSnapshots.closeTime);

    const mapped = rows.map((r) => ({ t: r.t.getTime(), p: +r.p, v: +(r.v ?? 0) }));
    const withBands = computeRollingBands(mapped);
    return c.json(withBands);
  }

  const lookbackRows = await getDb()
    .select({
      t: priceSnapshots.closeTime,
      p: priceSnapshots.price,
      v: priceSnapshots.volume,
    })
    .from(priceSnapshots)
    .where(eq(priceSnapshots.symbol, symbol))
    .orderBy(desc(priceSnapshots.closeTime))
    .limit(WINDOW_SIZE);

  const newRows = await getDb()
    .select({
      t: priceSnapshots.closeTime,
      p: priceSnapshots.price,
      v: priceSnapshots.volume,
    })
    .from(priceSnapshots)
    .where(
      and(
        eq(priceSnapshots.symbol, symbol),
        gte(priceSnapshots.closeTime, new Date(after))
      )
    )
    .orderBy(priceSnapshots.closeTime);

  if (newRows.length === 0) return c.json([]);

  const combined = [
    ...lookbackRows.reverse().filter((r) => r.t.getTime() < after),
    ...newRows,
  ].map((r) => ({ t: r.t.getTime(), p: +r.p, v: +(r.v ?? 0) }));

  const allWithBands = computeRollingBands(combined);
  const onlyNew = allWithBands.filter((r) => r[0] >= after);
  return c.json(onlyNew);
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
    startSyncScheduler();
  });
}
