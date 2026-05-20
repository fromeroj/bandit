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
import { eq, gte, and } from "drizzle-orm";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.get("/api/sync/prices", async (c) => {
  const after = parseInt(c.req.query("after") || "0");
  const limit = Math.min(parseInt(c.req.query("limit") || "50000"), 100000);
  const symbol = c.req.query("symbol") || "BTCUSDT";

  const conditions = [eq(priceSnapshots.symbol, symbol)];
  if (after > 0) {
    conditions.push(gte(priceSnapshots.closeTime, new Date(after)));
  }

  const rows = await getDb()
    .select({
      t: priceSnapshots.closeTime,
      p: priceSnapshots.price,
      o: priceSnapshots.open,
      h: priceSnapshots.high,
      l: priceSnapshots.low,
      v: priceSnapshots.volume,
    })
    .from(priceSnapshots)
    .where(and(...conditions))
    .orderBy(priceSnapshots.closeTime)
    .limit(limit);

  const compact = rows.map((r) => [
    r.t.getTime(),
    +r.p,
    +(r.o ?? r.p),
    +(r.h ?? r.p),
    +(r.l ?? r.p),
    +(r.v ?? 0),
  ]);
  return c.json(compact);
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
