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
        mean REAL,
        upperBand REAL,
        lowerBand REAL
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
        setLoadingPhase("Downloading price data...");
        const res = await fetch("/api/sync/prices?after=0");
        if (!res.ok) {
          console.error("[localdb] Sync HTTP error:", res.status);
          return;
        }
        const rows: number[][] = await res.json();
        if (!rows || rows.length === 0) return;

        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(
          "INSERT OR IGNORE INTO prices (t, p, mean, upperBand, lowerBand) VALUES (?, ?, ?, ?, ?)"
        );
        const BATCH = 5000;
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          stmt.run([r[0], r[1], r[2], r[3], r[4]]);
          if (i > 0 && i % BATCH === 0) {
            stmt.free();
            db.run("COMMIT");
            setLoadingRows(i);
            setLoadingPhase(
              `Storing ${i.toLocaleString()} / ${rows.length.toLocaleString()} candles...`
            );
            db.run("BEGIN TRANSACTION");
            const s2 = db.prepare(
              "INSERT OR IGNORE INTO prices (t, p, mean, upperBand, lowerBand) VALUES (?, ?, ?, ?, ?)"
            );
            for (let j = i; j < Math.min(i + BATCH, rows.length); j++) {
              s2.run([rows[j][0], rows[j][1], rows[j][2], rows[j][3], rows[j][4]]);
            }
            s2.free();
          }
        }
        stmt.free();
        db.run("COMMIT");

        setLoadingRows(rows.length);
        setLoadingPhase(
          `Ready! ${rows.length.toLocaleString()} candles loaded`
        );
        console.log(`[localdb] Initial load complete: ${rows.length} rows`);
        setTimeout(() => setSynced(true), 600);
      } else {
        const res = await fetch(`/api/sync/prices?after=${existingMax}`);
        if (!res.ok) return;
        const rows: number[][] = await res.json();
        if (!rows || rows.length === 0) return;

        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(
          "INSERT OR IGNORE INTO prices (t, p, mean, upperBand, lowerBand) VALUES (?, ?, ?, ?, ?)"
        );
        for (const r of rows) {
          stmt.run([r[0], r[1], r[2], r[3], r[4]]);
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

    const cutoff = Date.now() - rangeHours * 3600 * 1000;
    const stmt = db.prepare(
      "SELECT t, p, mean, upperBand, lowerBand FROM prices WHERE t >= ? ORDER BY t"
    );
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
