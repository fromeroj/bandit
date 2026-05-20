# Bandit - BTC Mean Reversion Arbitrage Dashboard

**Live:** [bandit.konen.guru](https://bandit.konen.guru/)

A full-stack web application for modeling and visualizing Binance BTC/USDT mean reversion arbitrage trading bands with paper trading, backtesting, and analytics.

Built with **React 19**, **Vite 7**, **Hono**, **tRPC**, **Drizzle ORM**, **MySQL**, and **sql.js** (SQLite WASM for browser-side analytics).

## Architecture

- **Frontend:** React + TypeScript + Tailwind CSS + Recharts + sql.js (in-browser SQLite)
- **Backend:** Hono (Node.js) + tRPC server (co-located in same process)
- **Database:** MySQL via Drizzle ORM (server-side) + sql.js WASM (browser-side)
- **Data:** Live Binance API (1m klines, 20s ticker) with background sync
- **Build:** Vite (frontend) + esbuild (backend API bundle)

## Pages

| Route            | Description                                              |
| ---------------- | ------------------------------------------------------- |
| `/`              | Dashboard - live price, rolling Bollinger Bands, trades  |
| `/analytics`     | Analytics - grid search, P&L charts, win/loss stats      |
| `/settings`      | Settings - band configuration, fee parameters            |
| `/documentation` | Docs - strategy overview, parameters, sync intervals      |

## Features

- **1-minute candle resolution** with ~200k rows of historical data
- **Rolling Bollinger Bands** calculated per candle (48h window, 2 sigma)
- **Browser-side SQLite** via sql.js WASM for fast local chart queries
- **Live Binance sync** - klines every 60s, ticker every 20s
- **Paper trading** with entry/exit tracking and P&L calculation
- **Backtesting engine** with win rate, Sharpe ratio, max drawdown
- **Fee breakdown** - maker/taker/withdrawal with min profitable spread

## Prerequisites

- Node.js 22+
- MySQL 8+
- npm

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run db:push
npx tsx reseed.ts        # Fetch 1m candles from Binance (Jan 2026 to now)
npm run build
NODE_ENV=production node dist/boot.js
```

The server runs on port 3000 by default (override with `PORT` env var).

## Environment Variables

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `DATABASE_URL`       | MySQL connection string              |
| `APP_ID`             | Application ID (Kimi OAuth)          |
| `APP_SECRET`         | App secret for JWT signing           |
| `KIMI_AUTH_URL`      | Kimi OAuth server URL (backend)      |
| `KIMI_OPEN_URL`      | Kimi Open Platform URL               |
| `VITE_KIMI_AUTH_URL` | Kimi OAuth URL (browser-facing)      |
| `VITE_APP_ID`        | OAuth app ID (browser-facing)        |
| `OWNER_UNION_ID`     | Union ID for admin role assignment   |
| `PORT`               | Server port (default: 3000)          |

## Development

```bash
npm run dev        # Start Vite dev server with HMR + API
npm run lint       # Run ESLint
npm run check      # TypeScript type checking
npm run format     # Prettier formatting
npm run test       # Run tests (Vitest)
```

## Project Structure

```
app/
├── api/                # Backend (Hono + tRPC)
│   ├── boot.ts         # Server entry, sync scheduler, bulk export endpoint
│   ├── router.ts       # tRPC router aggregation
│   ├── bandRouter.ts   # Band configuration + full state API
│   ├── marketRouter.ts # Market data + sync endpoints
│   ├── tradeRouter.ts  # Paper trading API
│   ├── backtestRouter.ts
│   ├── feeRouter.ts
│   ├── queries/        # Database query functions
│   ├── kimi/           # Kimi OAuth integration
│   └── lib/            # Utilities (env, math, binance, scheduler)
├── db/
│   ├── schema.ts       # Drizzle ORM schema
│   ├── relations.ts    # Table relations
│   └── migrations/     # Generated migrations
├── contracts/          # Shared types/constants
├── src/                # Frontend (React)
│   ├── pages/          # Route pages
│   ├── components/     # UI components (Layout, nav)
│   ├── providers/      # Context providers (tRPC, LocalDB)
│   └── lib/            # Frontend utilities
├── public/             # Static assets (bandit.png, sql-wasm.wasm)
├── reseed.ts           # Historical 1m candle fetcher
└── vite.config.ts      # Vite + Hono dev server config
```

## Database Schema

- **users** - User accounts (Kimi OAuth)
- **price_snapshots** - Historical BTC/USDT 1-minute prices (201k+ rows)
- **band_configs** - Trading band parameters per user
- **trades** - Paper trade records
- **performance_logs** - Daily performance snapshots

## Deployment

Deployed on **Ubuntu 22.04** with nginx reverse proxy and Let's Encrypt SSL.

```
nginx (SSL) → localhost:3000 (Hono/Node.js)
```

## License

MIT
