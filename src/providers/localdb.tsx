import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import initSqlJs, { Database } from "sql.js";

interface LocalDB {
  db: Database | null;
  ready: boolean;
  lastSync: number;
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

const Ctx = createContext<LocalDB>({ db: null, ready: false, lastSync: 0, sync: async () => {}, queryChart: () => [] });

export function useLocalDB() {
  return useContext(Ctx);
}

export function LocalDBProvider({ children }: { children: React.ReactNode }) {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [lastSync, setLastSync] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
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
    return () => { mounted = false; };
  }, []);

  const sync = useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;

    try {
      const res = await fetch("/api/trpc/market.exportRange?input=%7B%22json%22%3A%7B%7D%7D");
      const json = await res.json();
      const rows: { t: number; p: number; o: number; h: number; l: number; v: number }[] = json?.result?.data?.json;
      if (!rows || rows.length === 0) return;

      const existingMax: number = db.exec("SELECT MAX(t) FROM prices")[0]?.values[0]?.[0] as number ?? 0;

      db.run("BEGIN TRANSACTION");
      const stmt = db.prepare("INSERT OR IGNORE INTO prices (t, p, o, h, l, v) VALUES (?, ?, ?, ?, ?, ?)");
      let newCount = 0;
      for (const r of rows) {
        if (r.t > existingMax) {
          stmt.run([r.t, r.p, r.o ?? r.p, r.h ?? r.p, r.l ?? r.p, r.v ?? 0]);
          newCount++;
        }
      }
      stmt.free();
      db.run("COMMIT");

      if (newCount > 0) {
        console.log(`[localdb] Synced ${newCount} new rows, total: ${db.exec("SELECT COUNT(*) FROM prices")[0].values[0][0]}`);
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
    const iv = setInterval(sync, 60 * 1000);
    return () => clearInterval(iv);
  }, [ready, sync]);

  return (
    <Ctx.Provider value={{ db: dbRef.current, ready, lastSync, sync, queryChart }}>
      {children}
    </Ctx.Provider>
  );
}
