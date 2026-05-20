# Bandit - Binance Arbitrage Band Model Dashboard

A full-stack web application for modeling and visualizing Binance BTC/USDT arbitrage trading bands with paper trading, backtesting, and analytics.

Built with **React 19**, **Vite 7**, **Hono**, **tRPC**, **Drizzle ORM**, and **MySQL**.

## Architecture

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend:** Hono (Node.js) + tRPC server (co-located in same project)
- **Database:** MySQL via Drizzle ORM (PlanetScale-compatible)
- **Build:** Vite (frontend) + esbuild (backend API bundle)

## Pages

| Route        | Description                                      |
| ------------ | ------------------------------------------------ |
| `/`          | Dashboard - live price, band visualization, trades |
| `/analytics` | Analytics - performance charts and win/loss stats  |
| `/settings`  | Settings - band configuration, fee parameters      |

## Prerequisites

- Node.js 20+
- MySQL 8+
- npm

## Setup

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MySQL connection string and other config

# Push database schema
npm run db:push

# Seed historical price data
mysql -u root -p your_db < seed.sql
# Or place btc_klines.csv and run:
npx tsx db/seed.ts

# Build for production
npm run build

# Start production server
npm start
```

The server runs on port 3000 by default (override with `PORT` env var).

## Environment Variables

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `APP_ID`             | Application ID (Kimi OAuth)          |
| `APP_SECRET`         | App secret for JWT signing           |
| `DATABASE_URL`       | MySQL connection string              |
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
│   ├── boot.ts         # Server entry point
│   ├── router.ts       # tRPC router aggregation
│   ├── bandRouter.ts   # Band configuration API
│   ├── marketRouter.ts # Market data API
│   ├── tradeRouter.ts  # Paper trading API
│   ├── backtestRouter.ts
│   ├── feeRouter.ts
│   ├── queries/        # Database query functions
│   ├── kimi/           # Kimi OAuth integration
│   └── lib/            # Shared utilities (env, math, http)
├── db/
│   ├── schema.ts       # Drizzle ORM schema
│   ├── relations.ts    # Table relations
│   ├── seed.ts         # Database seeder
│   └── migrations/     # Generated migrations
├── contracts/          # Shared types/constants
├── src/                # Frontend (React)
│   ├── pages/          # Route pages
│   ├── components/     # UI components (shadcn/ui)
│   ├── hooks/          # Custom React hooks
│   ├── providers/      # Context providers (tRPC)
│   └── lib/            # Frontend utilities
├── seed.sql            # Historical price data seed
├── btc_klines.csv      # Raw kline data from Binance
└── vite.config.ts      # Vite + Hono dev server config
```

## Database Schema

- **users** - User accounts (Kimi OAuth)
- **price_snapshots** - Historical BTC/USDT hourly prices
- **band_configs** - Trading band parameters per user
- **trades** - Paper trade records
- **performance_logs** - Daily performance snapshots

## Deployment

This app is deployed on **bandit.konen.guru** behind an nginx reverse proxy.

## License

Private
