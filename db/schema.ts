import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  double,
  mysqlEnum,
  int,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Price snapshots — historical price data from Binance
export const priceSnapshots = mysqlTable("price_snapshots", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().default("BTCUSDT"),
  price: double("price").notNull(),
  open: double("open"),
  high: double("high"),
  low: double("low"),
  volume: double("volume"),
  closeTime: timestamp("closeTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceSnapshot = typeof priceSnapshots.$inferSelect;
export type InsertPriceSnapshot = typeof priceSnapshots.$inferInsert;

// Band configs — user-configurable band parameters
export const bandConfigs = mysqlTable("band_configs", {
  id: serial("id").primaryKey(),
  userId: int("userId").notNull().default(1),
  symbol: varchar("symbol", { length: 20 }).notNull().default("BTCUSDT"),
  windowHours: int("windowHours").notNull().default(48),
  bandMultiplier: double("bandMultiplier").notNull().default(2.0),
  profitMarginPct: double("profitMarginPct").notNull().default(0.15),
  useBnbDiscount: boolean("useBnbDiscount").notNull().default(false),
  makerFeePct: double("makerFeePct").notNull().default(0.1),
  takerFeePct: double("takerFeePct").notNull().default(0.1),
  withdrawalFeeBtc: double("withdrawalFeeBtc").notNull().default(0),
  investmentAmount: double("investmentAmount").notNull().default(1000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type BandConfig = typeof bandConfigs.$inferSelect;
export type InsertBandConfig = typeof bandConfigs.$inferInsert;

// Trades — paper trade records
export const trades = mysqlTable("trades", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().default("BTCUSDT"),
  side: mysqlEnum("side", ["buy", "sell"]).notNull(),
  entryPrice: double("entryPrice").notNull(),
  exitPrice: double("exitPrice"),
  targetPrice: double("targetPrice"),
  quantity: double("quantity").notNull(),
  makerFee: double("makerFee").notNull(),
  takerFee: double("takerFee"),
  withdrawalFee: double("withdrawalFee"),
  grossPnl: double("grossPnl"),
  netPnl: double("netPnl"),
  status: mysqlEnum("status", ["open", "closed", "cancelled"])
    .notNull()
    .default("open"),
  enteredAt: timestamp("enteredAt").defaultNow().notNull(),
  exitedAt: timestamp("exitedAt"),
  holdingMinutes: int("holdingMinutes"),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = typeof trades.$inferInsert;

// Performance logs — daily/periodic performance snapshots
export const performanceLogs = mysqlTable("performance_logs", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().default("BTCUSDT"),
  date: varchar("date", { length: 10 }).notNull(),
  totalTrades: int("totalTrades").notNull().default(0),
  winningTrades: int("winningTrades").notNull().default(0),
  losingTrades: int("losingTrades").notNull().default(0),
  totalFees: double("totalFees").notNull().default(0),
  grossProfit: double("grossProfit").notNull().default(0),
  netProfit: double("netProfit").notNull().default(0),
  avgHoldingMinutes: double("avgHoldingMinutes").default(0),
  maxDrawdownPct: double("maxDrawdownPct").default(0),
  winRatePct: double("winRatePct").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceLog = typeof performanceLogs.$inferSelect;
export type InsertPerformanceLog = typeof performanceLogs.$inferInsert;
