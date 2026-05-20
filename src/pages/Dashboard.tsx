import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useLocalDB, type ChartRow } from "@/providers/localdb";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Minus,
  Clock,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Wallet,
} from "lucide-react";

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPct(pct: number): string {
  return pct.toFixed(2);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + " " + d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

/* ─── Hero Section ─── */
function HeroSection({
  price,
  bands,
  fees,
}: {
  price: number;
  bands: any;
  fees: any;
}) {
  const priceInRange = price > 0 && bands.upperBand > 0;
  const bandRange = bands.upperBand - bands.lowerBand;
  const positionInBand = priceInRange
    ? Math.max(
        0,
        Math.min(100, ((price - bands.lowerBand) / bandRange) * 100)
      )
    : 50;

  const signalColor =
    bands.signal === "buy"
      ? "var(--color-accent-buy)"
      : bands.signal === "sell"
      ? "var(--color-accent-sell)"
      : "var(--color-accent-band-line)";

  const SignalIcon =
    bands.signal === "buy"
      ? ArrowDown
      : bands.signal === "sell"
      ? ArrowUp
      : Minus;

  return (
    <div className="card-surface mb-6">
      <div className="grid grid-cols-3 gap-8 items-center">
        {/* Current Price */}
        <div>
          <div className="data-label mb-1">BTC/USDT</div>
          <div
            className="text-3xl font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-primary)",
            }}
          >
            ${formatPrice(price)}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Live price
          </div>
        </div>

        {/* Band Visualizer */}
        <div>
          <div className="data-label mb-2">Band Position</div>
          <div
            className="relative h-3 rounded-sm overflow-hidden mb-2"
            style={{ background: "var(--color-bg-surface)" }}
          >
            {/* Buy zone */}
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: "33%",
                background:
                  "linear-gradient(90deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))",
              }}
            />
            {/* Sell zone */}
            <div
              className="absolute right-0 top-0 h-full"
              style={{
                width: "33%",
                background:
                  "linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.3))",
              }}
            />
            {/* Position marker */}
            <div
              className="absolute top-0 w-0 h-0"
              style={{
                left: `${positionInBand}%`,
                transform: "translateX(-50%)",
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${signalColor}`,
                marginTop: "6px",
              }}
            />
          </div>
          <div className="flex justify-between">
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent-buy)",
              }}
            >
              ${formatPrice(bands.lowerBand)}
            </span>
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {formatPct(bands.bandWidthPct)}% band
            </span>
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent-sell)",
              }}
            >
              ${formatPrice(bands.upperBand)}
            </span>
          </div>
        </div>

        {/* Signal Panel */}
        <div className="flex items-center justify-end gap-4">
          <div className="text-right">
            <div className="data-label mb-1">Signal</div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm"
              style={{
                background: `${signalColor}15`,
                border: `1px solid ${signalColor}40`,
              }}
            >
              <SignalIcon
                className="w-4 h-4"
                style={{ color: signalColor }}
              />
              <span
                className="text-sm font-semibold uppercase"
                style={{ color: signalColor }}
              >
                {bands.signal}
              </span>
            </div>
          </div>
          {fees.targetGainPct > 0 && (
            <div className="text-right">
              <div className="data-label mb-1">Target</div>
              <div
                className="mono-value"
                style={{ color: "var(--color-accent-neutral)" }}
              >
                ${formatPrice(fees.targetSellPrice)}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                +{formatPct(fees.targetGainPct)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Price Chart with Bands ─── */
function PriceChart({ data }: { data: any[] }) {
  const [range, setRange] = useState(24);
  const { ready, queryChart, lastSync } = useLocalDB();
  const [localData, setLocalData] = useState<ChartRow[]>([]);

  const ranges = [
    { label: "6H", hours: 6 },
    { label: "12H", hours: 12 },
    { label: "24H", hours: 24 },
    { label: "48H", hours: 48 },
    { label: "14D", hours: 336 },
    { label: "1M", hours: 720 },
  ];

  useEffect(() => {
    if (!ready) return;
    const rows = queryChart(range);
    setLocalData(rows);
  }, [ready, range, lastSync]);

  const chartData = localData.length > 0 ? localData : (() => {
    const cutoff = Date.now() - range * 3600 * 1000;
    return data.filter((d) => new Date(d.time).getTime() >= cutoff);
  })();

  const formatXAxis = useMemo(() => {
    const daySet = new Set<string>();
    return (iso: string) => {
      const d = new Date(iso);
      const dayKey = `${d.getMonth()}-${d.getDate()}`;
      const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      if (range > 48) {
        return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
      }
      daySet.add(dayKey);
      if (daySet.size > 1) {
        return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
      }
      return time;
    };
  }, [range]);

  return (
    <div className="card-surface mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--color-text-primary)",
          }}
        >
          Price & Bands
        </h2>
        <div className="flex items-center gap-1">
          {ranges.map((r) => (
            <button
              key={r.hours}
              onClick={() => setRange(r.hours)}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  range === r.hours
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
                borderBottom:
                  range === r.hours
                    ? "2px solid var(--color-accent-neutral)"
                    : "2px solid transparent",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: "55vh", minHeight: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-accent-band-line)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-accent-band-line)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--color-border-subtle)" }}
              tickLine={false}
              interval={"preserveStartEnd"}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-text-secondary)", marginBottom: 4 }}
              formatter={(value: any, name: string) => {
                if (name === "price") return [`$${formatPrice(value)}`, "Price"];
                if (name === "upperBand") return [`$${formatPrice(value)}`, "Upper"];
                if (name === "lowerBand") return [`$${formatPrice(value)}`, "Lower"];
                if (name === "mean") return [`$${formatPrice(value)}`, "Mean"];
                return [value, name];
              }}
              labelFormatter={(label) => formatTime(label)}
            />
            <Area
              type="monotone"
              dataKey="upperBand"
              stroke="transparent"
              fill="var(--color-accent-band-line)"
              fillOpacity={0.12}
              dot={false}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="lowerBand"
              stroke="var(--color-accent-band-line)"
              strokeDasharray="4 4"
              fill="var(--color-bg-elevated)"
              fillOpacity={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="mean"
              stroke="var(--color-text-muted)"
              strokeDasharray="2 2"
              dot={false}
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="upperBand"
              stroke="var(--color-accent-band-line)"
              strokeDasharray="4 4"
              dot={false}
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-accent-neutral)"
              dot={false}
              strokeWidth={1.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Fee Breakdown ─── */
function FeeBreakdown({ fees }: { fees: any }) {
  const items = [
    {
      label: "Maker Fee",
      pct: fees.makerFeePct,
      usd: fees.makerFeeUsd,
      icon: Wallet,
    },
    {
      label: "Taker Fee",
      pct: fees.takerFeePct,
      usd: fees.takerFeeUsd,
      icon: Zap,
    },
    {
      label: "Withdrawal",
      pct: null,
      usd: fees.withdrawalFeeUsd,
      icon: DollarSign,
    },
  ];

  return (
    <div className="card-surface">
      <h3
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
        }}
      >
        Fee Breakdown
      </h3>

      <div className="space-y-3 mb-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--color-accent-fee)" }}
                />
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--color-text-secondary)" }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  ${fees.makerFeeUsd?.toFixed(2) || "0.00"}
                </span>
                {item.pct !== null && (
                  <span
                    className="text-xs ml-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ({item.pct}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div
        className="p-3 rounded-sm mb-4"
        style={{ background: "var(--color-bg-surface)" }}
      >
        <div className="flex justify-between items-center mb-1">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Total Fees / Round Trip
          </span>
          <span
            className="text-lg font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-fee)",
            }}
          >
            ${fees.totalFeesUsd?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Threshold */}
      <div
        className="p-3 rounded-sm"
        style={{
          background: `${fees.minSpreadPct > 0 ? "rgba(34,197,94,0.08)" : "var(--color-bg-surface)"}`,
          border: `1px solid ${fees.minSpreadPct > 0 ? "rgba(34,197,94,0.2)" : "var(--color-border-subtle)"}`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Target
            className="w-4 h-4"
            style={{ color: "var(--color-accent-buy)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Min Profitable Spread
          </span>
        </div>
        <div
          className="text-2xl font-semibold"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-accent-buy)",
          }}
        >
          {fees.minSpreadPct?.toFixed(3)}%
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          ${fees.minSpreadUsd?.toFixed(2)} USD required to break even
        </div>
      </div>

      {/* Recommended Target */}
      <div className="mt-3 p-3 rounded-sm" style={{ background: "var(--color-bg-surface)" }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "var(--color-accent-neutral)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Recommended Target
          </span>
        </div>
        <div
          className="text-xl font-semibold"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-accent-neutral)",
          }}
        >
          +{fees.targetGainPct?.toFixed(3)}%
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Target sell: ${fees.targetSellPrice?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

/* ─── Threshold Visualizer ─── */
function ThresholdVisualizer({ fees }: { fees: any }) {
  const total = fees.targetGainPct || 1;
  const makerPct = (fees.makerFeePct || 0) / total * 100;
  const takerPct = (fees.takerFeePct || 0) / total * 100;
  const withdrawalPct = ((fees.withdrawalFeeUsd || 0) / (fees.makerFeeUsd || 1) * (fees.makerFeePct || 0.1)) / total * 100;
  const profitPct = Math.max(0, 100 - makerPct - takerPct - withdrawalPct);

  return (
    <div className="card-surface">
      <h3
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
        }}
      >
        Fee Composition
      </h3>

      {/* Stacked bar */}
      <div
        className="relative h-8 rounded-sm overflow-hidden mb-4 flex"
        style={{ background: "var(--color-bg-surface)" }}
      >
        <div
          style={{
            width: `${makerPct}%`,
            background: "var(--color-accent-fee)",
            opacity: 0.8,
          }}
          title={`Maker: ${fees.makerFeePct}%`}
        />
        <div
          style={{
            width: `${takerPct}%`,
            background: "var(--color-accent-fee)",
            opacity: 0.6,
          }}
          title={`Taker: ${fees.takerFeePct}%`}
        />
        <div
          style={{
            width: `${withdrawalPct}%`,
            background: "var(--color-accent-fee)",
            opacity: 0.3,
          }}
          title={`Withdrawal: $${fees.withdrawalFeeUsd?.toFixed(2)}`}
        />
        <div
          style={{
            width: `${profitPct}%`,
            background: "var(--color-accent-buy)",
            opacity: 0.5,
          }}
          title={`Profit margin`}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Maker Fee", color: "var(--color-accent-fee)", opacity: 0.8, value: `${fees.makerFeePct}%` },
          { label: "Taker Fee", color: "var(--color-accent-fee)", opacity: 0.6, value: `${fees.takerFeePct}%` },
          { label: "Withdrawal", color: "var(--color-accent-fee)", opacity: 0.3, value: `$${fees.withdrawalFeeUsd?.toFixed(2)}` },
          { label: "Profit Margin", color: "var(--color-accent-buy)", opacity: 0.5, value: `+${(fees.targetGainPct - fees.minSpreadPct)?.toFixed(3)}%` },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: item.color, opacity: item.opacity }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item.label}
            </span>
            <span
              className="text-xs ml-auto"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-primary)",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Trade History Table ─── */
function TradeHistory() {
  const { data: trades } = trpc.trade.list.useQuery(
    { symbol: "BTCUSDT", limit: 20 },
    { refetchInterval: 30000 }
  );

  return (
    <div className="card-surface">
      <h3
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
        }}
      >
        Trade History
      </h3>

      {(!trades || trades.length === 0) ? (
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          No trades yet. Signals will trigger simulated trades when price
          touches the band boundaries.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--color-bg-surface)" }}>
                {["Entry", "Exit", "Hold Time", "Gross P&L", "Fees", "Net P&L", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-xs font-medium"
                      style={{
                        color: "var(--color-text-secondary)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {trades?.map((trade) => {
                const statusColor =
                  trade.status === "open"
                    ? "var(--color-accent-neutral)"
                    : (trade.netPnl || 0) > 0
                    ? "var(--color-accent-buy)"
                    : (trade.netPnl || 0) < 0
                    ? "var(--color-accent-sell)"
                    : "var(--color-text-muted)";

                const statusLabel =
                  trade.status === "open"
                    ? "OPEN"
                    : (trade.netPnl || 0) > 0
                    ? "WIN"
                    : (trade.netPnl || 0) < 0
                    ? "LOSS"
                    : "BREAK";

                return (
                  <tr
                    key={trade.id}
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <td className="px-3 py-2">
                      <div
                        className="text-xs"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ${formatPrice(trade.entryPrice)}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {trade.enteredAt
                          ? new Date(trade.enteredAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div
                        className="text-xs"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {trade.exitPrice
                          ? `$${formatPrice(trade.exitPrice)}`
                          : "-"}
                      </div>
                    </td>
                    <td
                      className="px-3 py-2 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {trade.holdingMinutes
                        ? formatDuration(trade.holdingMinutes)
                        : "-"}
                    </td>
                    <td
                      className="px-3 py-2 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          (trade.grossPnl || 0) >= 0
                            ? "var(--color-accent-buy)"
                            : "var(--color-accent-sell)",
                      }}
                    >
                      {trade.grossPnl ? `$${trade.grossPnl.toFixed(2)}` : "-"}
                    </td>
                    <td
                      className="px-3 py-2 text-xs"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-accent-fee)",
                      }}
                    >
                      {trade.makerFee !== null && trade.takerFee !== null
                        ? `$${(
                            (trade.makerFee || 0) +
                            (trade.takerFee || 0) +
                            (trade.withdrawalFee || 0)
                          ).toFixed(2)}`
                        : "-"}
                    </td>
                    <td
                      className="px-3 py-2 text-xs font-medium"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: statusColor,
                      }}
                    >
                      {trade.netPnl ? `$${trade.netPnl.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-sm font-medium"
                        style={{
                          background: `${statusColor}20`,
                          color: statusColor,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Backtest Summary ─── */
function BacktestSummary() {
  const { data: result } = trpc.backtest.run.useQuery(
    { symbol: "BTCUSDT" },
    { refetchInterval: 60000 }
  );

  if (!result || result.totalTrades === 0) {
    return (
      <div className="card-surface">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Backtest Summary
        </h3>
        <div
          className="text-center py-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          Insufficient data for backtesting. Need at least 48 hours of price
          history.
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Win Rate",
      value: `${result.winRatePct.toFixed(1)}%`,
      icon: Percent,
      color: "var(--color-accent-buy)",
    },
    {
      label: "Total Trades",
      value: String(result.totalTrades),
      icon: Zap,
      color: "var(--color-accent-neutral)",
    },
    {
      label: "Avg Hold Time",
      value: formatDuration(result.avgHoldingMinutes),
      icon: Clock,
      color: "var(--color-accent-band-line)",
    },
    {
      label: "Net Profit",
      value: `$${result.totalNetProfit.toFixed(2)}`,
      icon: result.totalNetProfit >= 0 ? TrendingUp : TrendingDown,
      color:
        result.totalNetProfit >= 0
          ? "var(--color-accent-buy)"
          : "var(--color-accent-sell)",
    },
    {
      label: "Max Drawdown",
      value: `${result.maxDrawdownPct.toFixed(2)}%`,
      icon: TrendingDown,
      color: "var(--color-accent-sell)",
    },
    {
      label: "Sharpe Ratio",
      value: result.sharpeRatio.toFixed(2),
      icon: Target,
      color: "var(--color-accent-neutral)",
    },
  ];

  return (
    <div className="card-surface">
      <h3
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
        }}
      >
        Backtest Summary
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="text-center">
              <div className="data-label mb-1">{m.label}</div>
              <Icon
                className="w-4 h-4 mx-auto mb-1"
                style={{ color: m.color }}
              />
              <div
                className="text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: m.color,
                }}
              >
                {m.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { data: fullState } = trpc.band.fullState.useQuery(
    { symbol: "BTCUSDT" },
    { refetchInterval: 30000 }
  );

  const price = fullState?.bands?.currentPrice || 0;
  const bands = fullState?.bands || {
    mean: 0,
    std: 0,
    upperBand: 0,
    lowerBand: 0,
    bandWidth: 0,
    bandWidthPct: 0,
    signal: "hold" as const,
    currentPrice: 0,
    dataPoints: 0,
  };
  const fees = fullState?.fees || {
    makerFeePct: 0.1,
    takerFeePct: 0.1,
    withdrawalFeeBtc: 0.0002,
    withdrawalFeeUsd: 0,
    makerFeeUsd: 0,
    takerFeeUsd: 0,
    totalFeesUsd: 0,
    minSpreadUsd: 0,
    minSpreadPct: 0,
    targetGainPct: 0,
    targetGainUsd: 0,
    targetSellPrice: 0,
  };
  const chartData = fullState?.recentPrices || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <HeroSection price={price} bands={bands} fees={fees} />

      {/* Price Chart */}
      <PriceChart data={chartData} />

      {/* Two Column: Fees + Threshold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeeBreakdown fees={fees} />
        <ThresholdVisualizer fees={fees} />
      </div>

      {/* Trade History */}
      <TradeHistory />

      {/* Backtest Summary */}
      <BacktestSummary />
    </div>
  );
}
