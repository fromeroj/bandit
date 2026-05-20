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
  getLatest: () => LatestRow | null;
  queryChart: (rangeHours: number) => ChartRow[];
}

export interface LatestRow {
  price: number;
  mean: number;
  upperBand: number;
  lowerBand: number;
  signal: "buy" | "sell" | "hold";
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
  getLatest: () => null,
  queryChart: () => [],
});

export function useLocalDB() {
  return useContext(Ctx);
}

const IDB_NAME = "bandit";
const IDB_STORE = "databases";
const IDB_KEY = "prices";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIDB(): Promise<Uint8Array | null> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(data: Uint8Array): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(data, IDB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function insertRows(db: Database, rows: number[][]): void {
  db.run("BEGIN TRANSACTION");
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO prices (t, p, mean, upperBand, lowerBand) VALUES (?, ?, ?, ?, ?)"
  );
  for (const r of rows) {
    stmt.run([r[0], r[1], r[2], r[3], r[4]]);
  }
  stmt.free();
  db.run("COMMIT");
}

export function LocalDBProvider({ children }: { children: React.ReactNode }) {
  const dbRef = useRef<Database | null>(null);
  const syncingRef = useRef(false);
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

      const saved = await loadFromIDB();
      let db: Database;
      if (saved) {
        db = new SQL.Database(saved);
        console.log("[localdb] Restored from IndexedDB");
      } else {
        db = new SQL.Database();
        db.run(`CREATE TABLE IF NOT EXISTS prices (
          t INTEGER PRIMARY KEY,
          p REAL NOT NULL,
          mean REAL,
          upperBand REAL,
          lowerBand REAL
        )`);
        console.log("[localdb] Fresh database created");
      }

      dbRef.current = db;
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sync = useCallback(async () => {
    const db = dbRef.current;
    if (!db || syncingRef.current) return;
    syncingRef.current = true;

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

        const BATCH = 10000;
        for (let i = 0; i < rows.length; i += BATCH) {
          const batch = rows.slice(i, Math.min(i + BATCH, rows.length));
          insertRows(db, batch);
          setLoadingRows(Math.min(i + BATCH, rows.length));
          setLoadingPhase(
            `Storing ${Math.min(i + BATCH, rows.length).toLocaleString()} / ${rows.length.toLocaleString()} candles...`
          );
        }

        await saveToIDB(db.export());

        setLoadingRows(rows.length);
        setLoadingPhase(
          `Ready! ${rows.length.toLocaleString()} candles loaded`
        );
        console.log(`[localdb] Initial load complete: ${rows.length} rows`);
        setSynced(true);
      } else {
        const res = await fetch(`/api/sync/prices?after=${existingMax}`);
        if (!res.ok) return;
        const rows: number[][] = await res.json();
        if (!rows || rows.length === 0) return;

        insertRows(db, rows);
        await saveToIDB(db.export());

        console.log(`[localdb] Incremental sync: ${rows.length} new rows`);
        setSynced(true);
      }
      setLastSync(Date.now());
    } catch (err) {
      console.error("[localdb] Sync error:", err);
    } finally {
      syncingRef.current = false;
    }
  }, []);

  const getLatest = useCallback((): LatestRow | null => {
    const db = dbRef.current;
    if (!db) return null;
    const result = db.exec("SELECT p, mean, upperBand, lowerBand FROM prices ORDER BY t DESC LIMIT 1");
    if (!result[0] || !result[0].values[0]) return null;
    const [p, mean, upperBand, lowerBand] = result[0].values[0] as number[];
    let signal: "buy" | "sell" | "hold" = "hold";
    if (p <= lowerBand) signal = "buy";
    else if (p >= upperBand) signal = "sell";
    return { price: p, mean, upperBand, lowerBand, signal };
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
  }, [ready, sync]);

  useEffect(() => {
    if (!synced) return;
    const iv = setInterval(sync, 20 * 1000);
    return () => clearInterval(iv);
  }, [synced, sync]);

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
        getLatest,
        queryChart,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
