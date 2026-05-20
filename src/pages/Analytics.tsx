import { trpc } from "@/providers/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Grid3x3, BarChart3 } from "lucide-react";

/* ─── Grid Search Section ─── */
function GridSearch() {
  const { data, isLoading } = trpc.backtest.gridSearch.useQuery({
    symbol: "BTCUSDT",
  });

  if (isLoading) {
    return (
      <div className="card-surface">
        <div className="animate-pulse space-y-4">
          <div
            className="h-4 rounded"
            style={{ background: "var(--color-bg-surface)", width: "30%" }}
          />
          <div
            className="h-64 rounded"
            style={{ background: "var(--color-bg-surface)" }}
          />
        </div>
      </div>
    );
  }

  if (!data?.grid || data.grid.length === 0) {
    return (
      <div className="card-surface">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Optimal Parameter Search
        </h3>
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          Insufficient data for parameter optimization.
        </div>
      </div>
    );
  }

  const { grid, bestParams } = data;

  // Build the 5x5 grid matrix
  const windows = [12, 24, 48, 72, 96];
  const multipliers = [1.0, 1.5, 2.0, 2.5, 3.0];

  const maxProfit = Math.max(...grid.map((g) => g.netProfit), 1);
  const minProfit = Math.min(...grid.map((g) => g.netProfit), 0);

  return (
    <div className="card-surface">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid3x3
            className="w-5 h-5"
            style={{ color: "var(--color-accent-neutral)" }}
          />
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Optimal Parameter Search
          </h3>
        </div>
        {bestParams && (
          <div
            className="text-xs px-2 py-1 rounded-sm"
            style={{
              background: "rgba(34,197,94,0.15)",
              color: "var(--color-accent-buy)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Best: {bestParams.windowHours}h / k={bestParams.bandMultiplier}
          </div>
        )}
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-6 gap-1 mb-1">
        <div
          className="text-[10px]"
          style={{ color: "var(--color-text-muted)" }}
        />
        {windows.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-medium"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {w}h
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      {multipliers.map((k) => (
        <div key={k} className="grid grid-cols-6 gap-1 mb-1">
          <div
            className="text-[10px] font-medium flex items-center"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            k={k}
          </div>
          {windows.map((w) => {
            const cell = grid.find(
              (g) => g.windowHours === w && g.bandMultiplier === k
            );
            const profit = cell?.netProfit || 0;
            const isBest =
              bestParams &&
              bestParams.windowHours === w &&
              bestParams.bandMultiplier === k;

            const normalizedProfit =
              profit >= 0 ? profit / maxProfit : profit / Math.abs(minProfit);

            return (
              <div
                key={`${w}-${k}`}
                className="relative h-12 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105"
                style={{
                  background: isBest
                    ? "rgba(34,197,94,0.3)"
                    : `rgba(${profit >= 0 ? "34,197,94" : "239,68,68"}, ${Math.abs(normalizedProfit) * 0.4 + 0.05})`,
                  border: isBest
                    ? "2px solid var(--color-accent-buy)"
                    : "1px solid var(--color-border-subtle)",
                }}
              >
                <span
                  className="text-[10px] font-medium"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color:
                      isBest
                        ? "var(--color-accent-buy)"
                        : Math.abs(normalizedProfit) > 0.5
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                  }}
                >
                  ${profit.toFixed(0)}
                </span>
                {cell && cell.totalTrades > 0 && (
                  <span
                    className="text-[8px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {cell.totalTrades}t
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div
        className="mt-3 text-[10px]"
        style={{ color: "var(--color-text-muted)" }}
      >
        Color intensity = net profit magnitude. Green = profit, Red = loss.
        Best parameters highlighted.
      </div>
    </div>
  );
}

/* ─── Backtest Trades Chart ─── */
function BacktestTrades() {
  const { data: result } = trpc.backtest.run.useQuery({ symbol: "BTCUSDT" });

  if (!result || result.totalTrades === 0) {
    return (
      <div className="card-surface">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Simulated Trades
        </h3>
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          No backtest trades to display.
        </div>
      </div>
    );
  }

  const tradeData = result.trades.map((t, i) => ({
    index: i + 1,
    netPnl: t.netPnl,
    color: t.netPnl >= 0 ? "var(--color-accent-buy)" : "var(--color-accent-sell)",
  }));

  return (
    <div className="card-surface">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        Simulated Trade P&L
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={tradeData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="index"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--color-border-subtle)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Net P&L"]}
            />
            <Bar dataKey="netPnl" radius={[2, 2, 0, 0]}>
              {tradeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Fee Impact Chart ─── */
function FeeImpact() {
  const { data: result } = trpc.backtest.run.useQuery({ symbol: "BTCUSDT" });

  if (!result || result.totalTrades === 0) {
    return (
      <div className="card-surface">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Fee Impact Analysis
        </h3>
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          No data available.
        </div>
      </div>
    );
  }

  // Cumulative data
  let cumGross = 0;
  let cumFees = 0;
  let cumNet = 0;
  const cumulativeData = result.trades.map((t, i) => {
    cumGross += t.grossPnl;
    cumFees += t.totalFees;
    cumNet += t.netPnl;
    return {
      trade: i + 1,
      gross: cumGross,
      fees: cumFees,
      net: cumNet,
    };
  });

  return (
    <div className="card-surface">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        Fee Impact Analysis
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={cumulativeData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="trade"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--color-border-subtle)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="gross"
              stroke="var(--color-accent-buy)"
              strokeWidth={1.5}
              dot={false}
              name="Gross Profit"
            />
            <Line
              type="monotone"
              dataKey="fees"
              stroke="var(--color-accent-fee)"
              strokeWidth={1.5}
              dot={false}
              name="Cumulative Fees"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="var(--color-accent-neutral)"
              strokeWidth={1.5}
              dot={false}
              name="Net Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Main Analytics Page ─── */
export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3
          className="w-5 h-5"
          style={{ color: "var(--color-accent-neutral)" }}
        />
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Analytics
        </h1>
      </div>

      {/* Grid Search */}
      <GridSearch />

      {/* Two Column: Trades + Fee Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BacktestTrades />
        <FeeImpact />
      </div>
    </div>
  );
}
