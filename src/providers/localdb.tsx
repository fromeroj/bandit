import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import initSqlJs, { Database } from "sql.js";

interface LocalDB {
  db: Database | null;
  ready: boolean;
  synced: boolean;
  lastSync: number;
  loadingRows: number;
  loadingPhase: string;
  sync: () => Promise<void>;
  queryChart: (rangeHours: number) => ChartRow[];
}

export interface ChartRow {
  time: string;
  price: number;
  upperBand: number;
  lowerBand: number;
  mean: number;
}

const Ctx = createContext<LocalDB>({
  db: null,
  ready: false,
  synced: false,
  lastSync: 0,
  loadingRows: 0,
  loadingPhase: "",
  sync: async () => {},
  queryChart: () => [],
});

export function useLocalDB() {
  return useContext(Ctx);
}

export function LocalDBProvider({ children }: { children: React.ReactNode }) {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [synced, setSynced] = useState(false);
  const [lastSync, setLastSync] = useState(0);
  const [loadingRows, setLoadingRows] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPhase("Loading SQLite engine...");
      const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
      const db = new SQL.Database();
      db.run(`CREATE TABLE IF NOT EXISTS prices (
        t INTEGER PRIMARY KEY,
        p REAL NOT NULL,
        o REAL,
        h REAL,
        l REAL,
        v REAL
      )`);
      dbRef.current = db;
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sync = useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;

    try {
      const existingMax: number =
        (db.exec("SELECT MAX(t) FROM prices")[0]?.values[0]?.[0] as number) ??
        0;

      if (existingMax === 0) {
        let after = 0;
        let fetched = 0;
        let page = 0;
        while (true) {
          page++;
          setLoadingPhase(
            `Downloading price data (page ${page})...`
          );
          const res = await fetch(
            `/api/sync/prices?after=${after}&limit=50000`
          );
          if (!res.ok) break;
          const rows: number[][] = await res.json();
          if (!rows || rows.length === 0) break;

          db.run("BEGIN TRANSACTION");
          const stmt = db.prepare(
            "INSERT OR IGNORE INTO prices (t, p, o, h, l, v) VALUES (?, ?, ?, ?, ?, ?)"
          );
          for (const r of rows) {
            stmt.run([r[0], r[1], r[2], r[3], r[4], r[5]]);
          }
          stmt.free();
          db.run("COMMIT");

          fetched += rows.length;
          after = rows[rows.length - 1][0];
          setLoadingRows(fetched);
          setLoadingPhase(
            `Downloaded ${fetched.toLocaleString()} rows (page ${page})...`
          );
          console.log(
            `[localdb] Fetched ${fetched} rows, latest: ${new Date(after).toISOString()}`
          );
          if (rows.length < 50000) break;
        }
        setLoadingPhase(
          `Ready! ${fetched.toLocaleString()} candles loaded`
        );
        console.log(`[localdb] Initial load complete: ${fetched} rows`);
        setTimeout(() => setSynced(true), 600);
      } else {
        const res = await fetch(
          `/api/sync/prices?after=${existingMax}&limit=5000`
        );
        if (!res.ok) return;
        const rows: number[][] = await res.json();
        if (!rows || rows.length === 0) return;

        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(
          "INSERT OR IGNORE INTO prices (t, p, o, h, l, v) VALUES (?, ?, ?, ?, ?, ?)"
        );
        for (const r of rows) {
          stmt.run([r[0], r[1], r[2], r[3], r[4], r[5]]);
        }
        stmt.free();
        db.run("COMMIT");

        console.log(`[localdb] Incremental sync: ${rows.length} new rows`);
      }
      setLastSync(Date.now());
    } catch (err) {
      console.error("[localdb] Sync error:", err);
    }
  }, []);

  const queryChart = useCallback((rangeHours: number): ChartRow[] => {
    const db = dbRef.current;
    if (!db) return [];

    const windowMins = 48 * 60;
    const cutoff = Date.now() - rangeHours * 3600 * 1000;

    const sql = `
      SELECT
        t,
        p,
        AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW) as mean,
        AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)
          + 2.0 * SQRT(AVG(p * p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)
          - AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)
          * AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)) as upperBand,
        AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)
          - 2.0 * SQRT(AVG(p * p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)
          - AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)
          * AVG(p) OVER (ORDER BY t ROWS BETWEEN ${windowMins} PRECEDING AND CURRENT ROW)) as lowerBand
      FROM prices
      WHERE t >= ?
      ORDER BY t
    `;

    const stmt = db.prepare(sql);
    stmt.bind([cutoff]);

    const rows: ChartRow[] = [];
    while (stmt.step()) {
      const r = stmt.getAsObject();
      rows.push({
        time: new Date(r.t as number).toISOString(),
        price: r.p as number,
        mean: r.mean as number,
        upperBand: r.upperBand as number,
        lowerBand: r.lowerBand as number,
      });
    }
    stmt.free();
    return rows;
  }, []);

  useEffect(() => {
    if (!ready) return;
    sync();
    const iv = setInterval(sync, 20 * 1000);
    return () => clearInterval(iv);
  }, [ready, sync]);

  return (
    <Ctx.Provider
      value={{
        db: dbRef.current,
        ready,
        synced,
        lastSync,
        loadingRows,
        loadingPhase,
        sync,
        queryChart,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
