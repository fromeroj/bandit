import { BookOpen, TrendingUp, Activity, BarChart3, Settings, Database, Server, Cpu, DollarSign, Zap, Target, ChevronRight } from "lucide-react";

function SectionHeader({ icon: Icon, title, id }: { icon: any; title: string; id: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-8 first:mt-0" id={id}>
      <div
        className="w-8 h-8 rounded-sm flex items-center justify-center"
        style={{ background: "var(--color-bg-surface)" }}
      >
        <Icon className="w-4 h-4" style={{ color: "var(--color-accent-neutral)" }} />
      </div>
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h2>
    </div>
  );
}

function DocCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-surface mb-4">
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="p-3 rounded-sm overflow-x-auto text-xs leading-relaxed"
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        fontFamily: "var(--font-mono)",
        color: "var(--color-text-secondary)",
      }}
    >
      {children}
    </pre>
  );
}

function Formula({ label, formula, description }: { label: string; formula: string; description?: string }) {
  return (
    <div
      className="p-3 rounded-sm mb-2"
      style={{
        background: "var(--color-bg-surface)",
        borderLeft: "3px solid var(--color-accent-band-line)",
      }}
    >
      <div
        className="text-xs mb-1 font-medium"
        style={{ color: "var(--color-accent-band-line)", fontFamily: "var(--font-sans)" }}
      >
        {label}
      </div>
      <div
        className="text-sm"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}
      >
        {formula}
      </div>
      {description && (
        <div
          className="text-xs mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

function ParamRow({ name, type, defaultVal, description }: { name: string; type: string; defaultVal: string; description: string }) {
  return (
    <div
      className="flex items-start gap-4 py-2"
      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
    >
      <div className="flex-shrink-0 w-36">
        <span
          className="text-xs font-medium"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}
        >
          {name}
        </span>
        <span
          className="text-[10px] ml-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {type}
        </span>
      </div>
      <div className="flex-shrink-0 w-16">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-sm"
          style={{ background: "var(--color-bg-surface)", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
        >
          {defaultVal}
        </span>
      </div>
      <div
        className="text-xs flex-1"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {description}
      </div>
    </div>
  );
}

function TOCItem({ label, id }: { label: string; id: string }) {
  return (
    <a
      href={`#${id}`}
      className="flex items-center gap-2 py-1.5 text-sm transition-colors hover:opacity-80"
      style={{ color: "var(--color-text-secondary)" }}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <ChevronRight className="w-3 h-3" style={{ color: "var(--color-text-muted)" }} />
      {label}
    </a>
  );
}

export default function Documentation() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen
          className="w-5 h-5"
          style={{ color: "var(--color-accent-neutral)" }}
        />
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Documentation
        </h1>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded ml-1 font-medium"
          style={{
            background: "var(--color-bg-surface)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          v8335440
        </span>
      </div>

      {/* Table of Contents */}
      <DocCard>
        <div
          className="text-xs font-semibold mb-3"
          style={{ color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Table of Contents
        </div>
        <div className="grid grid-cols-2 gap-x-6">
          <TOCItem label="1. Overview" id="overview" />
          <TOCItem label="2. Mathematical Model" id="math-model" />
          <TOCItem label="3. Fee Optimization" id="fee-optimization" />
          <TOCItem label="4. Trading Signals" id="trading-signals" />
          <TOCItem label="5. Backtest Engine" id="backtest-engine" />
          <TOCItem label="6. Grid Search Optimizer" id="grid-search" />
          <TOCItem label="7. Configuration Parameters" id="config-params" />
          <TOCItem label="8. API Reference" id="api-reference" />
          <TOCItem label="9. Database Schema" id="database-schema" />
          <TOCItem label="10. Pages Guide" id="pages-guide" />
          <TOCItem label="11. Architecture" id="architecture" />
          <TOCItem label="12. Auto-Refresh" id="auto-refresh" />
        </div>
      </DocCard>

      {/* ── 1. Overview ── */}
      <SectionHeader icon={TrendingUp} title="1. Overview" id="overview" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          <strong style={{ color: "var(--color-text-primary)" }}>Bandit</strong> is a BTC Mean Reversion Arbitrage Dashboard — a full-stack web application for modeling, visualizing, and backtesting Bollinger Band-based mean reversion trading strategies on BTC/USDT. It combines real-time band calculation, fee-aware profit threshold computation, paper trading, and exhaustive parameter optimization into a single tool.
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The core hypothesis is simple: Bitcoin prices oscillate around a rolling mean. When price deviates significantly below the mean (lower band), it presents a buying opportunity. When it deviates above (upper band), it signals a selling opportunity. The challenge is determining whether the spread between entry and exit is wide enough to overcome exchange fees and withdrawal costs — Bandit answers this precisely.
        </p>
        <div
          className="p-3 rounded-sm"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div className="text-xs font-medium mb-2" style={{ color: "var(--color-accent-neutral)" }}>
            Key Capabilities
          </div>
          <ul className="space-y-1">
            {[
              "Rolling-window Bollinger Band calculation with configurable parameters",
              "Fee-optimized break-even and target price computation (maker, taker, withdrawal)",
              "Full backtest engine with Sharpe ratio, max drawdown, and profit factor",
              "Grid search across 25 parameter combinations (5 windows x 5 multipliers)",
              "Paper trade tracking with entry/exit, P&L, and holding time",
              "30 days of real hourly BTC/USDT data (720 candles) pre-seeded",
              "Real-time auto-refresh every 30 seconds",
              "BNB fee discount support (0.075% maker/taker)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <span style={{ color: "var(--color-accent-buy)" }}>+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </DocCard>

      {/* ── 2. Mathematical Model ── */}
      <SectionHeader icon={Cpu} title="2. Mathematical Model" id="math-model" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The band detection uses a rolling-window Bollinger-style calculation. Over your configured window (default 48 hours of hourly candles), the system computes the arithmetic mean and population standard deviation of closing prices. These statistics define an upper and lower envelope around the mean price.
        </p>

        <div className="data-label mb-2">Step 1: Outlier Filtering</div>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
          Before computing bands, prices beyond 3 standard deviations from the raw mean are excluded. This prevents flash crashes or liquidation cascades from skewing the band calculation. If the window has fewer than 10 data points, filtering is skipped entirely to preserve statistical significance.
        </p>
        <CodeBlock>{`function filterOutliers(prices: number[]): number[] {
  const mean = average(prices);
  const std = populationStdDev(prices);
  const threshold = 3 * std;
  return prices.filter(p => Math.abs(p - mean) <= threshold);
}`}</CodeBlock>

        <div className="data-label mt-4 mb-2">Step 2: Band Calculation</div>
        <Formula
          label="Mean"
          formula="mean = (1/n) * sum(filtered_prices)"
          description="Simple arithmetic mean of filtered price data over the window"
        />
        <Formula
          label="Standard Deviation"
          formula="std = sqrt( (1/n) * sum((price - mean)^2) )"
          description="Population standard deviation (not sample std dev) — uses all data points in the window"
        />
        <Formula
          label="Upper Band"
          formula="upperBand = mean + k * std"
          description="The sell threshold: when price touches or exceeds this level, a SELL signal is generated"
        />
        <Formula
          label="Lower Band"
          formula="lowerBand = mean - k * std"
          description="The buy threshold: when price touches or falls below this level, a BUY signal is generated"
        />
        <Formula
          label="Band Width"
          formula="bandWidth = upperBand - lowerBand = 2 * k * std"
          description="The absolute dollar distance between bands; percentage = (bandWidth / mean) * 100"
        />

        <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
          The multiplier <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>k</span> controls the band width. With k=2.0 (default), bands capture ~95.4% of price action in a normal distribution. Higher k values produce wider bands with fewer but more significant signals; lower k values produce tighter bands with more frequent but less reliable signals.
        </p>
      </DocCard>

      {/* ── 3. Fee Optimization ── */}
      <SectionHeader icon={DollarSign} title="3. Fee-Optimized Threshold Calculator" id="fee-optimization" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Every fee is accounted for in the break-even calculation. Trading is only profitable when the price spread exceeds the total cost of executing a round-trip trade. The threshold calculator ensures you know exactly how much movement is needed before entering a position.
        </p>

        <div className="data-label mb-2">Fee Components (Round Trip)</div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 p-2 rounded-sm" style={{ background: "var(--color-bg-surface)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent-fee)", opacity: 0.8 }} />
            <div>
              <div className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                Maker Fee (Entry)
              </div>
              <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                Charged when your limit order is filled. Default 0.1% of investment amount. With BNB discount: 0.075%.
              </div>
            </div>
            <span className="text-xs ml-auto" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-fee)" }}>
              investment * makerFeePct / 100
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-sm" style={{ background: "var(--color-bg-surface)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent-fee)", opacity: 0.6 }} />
            <div>
              <div className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                Taker Fee (Exit)
              </div>
              <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                Charged when your market/stop order fills on exit. Default 0.1% of exit value. With BNB discount: 0.075%.
              </div>
            </div>
            <span className="text-xs ml-auto" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-fee)" }}>
              exitValue * takerFeePct / 100
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-sm" style={{ background: "var(--color-bg-surface)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent-fee)", opacity: 0.3 }} />
            <div>
              <div className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                Withdrawal Fee
              </div>
              <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                Fixed BTC withdrawal fee charged by Binance. Default 0.0002 BTC (~$15.50 at $77,500/BTC). Converted to USD at current price.
              </div>
            </div>
            <span className="text-xs ml-auto" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-fee)" }}>
              withdrawalFeeBtc * currentPrice
            </span>
          </div>
        </div>

        <div className="data-label mt-4 mb-2">Break-Even Calculation</div>
        <Formula
          label="Total Fees (USD)"
          formula="totalFeesUsd = makerFeeUsd + takerFeeUsd + withdrawalFeeUsd"
        />
        <Formula
          label="Minimum Spread"
          formula="minSpreadPct = (totalFeesUsd / investmentAmount) * 100"
          description="The minimum percentage price movement needed to break even"
        />
        <Formula
          label="Target Gain"
          formula="targetGainPct = minSpreadPct + profitMarginPct"
          description="Break-even spread plus your desired profit margin (default 0.15%)"
        />
        <Formula
          label="Target Sell Price"
          formula="targetSellPrice = currentPrice * (1 + targetGainPct / 100)"
          description="The exact price at which to sell to achieve the target gain"
        />

        <div
          className="p-3 rounded-sm mt-4"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: "var(--color-accent-fee)" }}>
            Example: $1,000 investment at $77,500 BTC
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Maker fee: $1.00 (0.1%) + Taker fee: $1.00 (0.1%) + Withdrawal: $15.50 (0.0002 BTC) = <strong style={{ color: "var(--color-text-primary)" }}>$17.50 total fees</strong>
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Min spread: 1.750% + Profit margin: 0.150% = <strong style={{ color: "var(--color-text-primary)" }}>1.900% target</strong> = $1,552.50 sell price
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Without BNB discount, a $1,000 trade needs ~$155 price movement (0.20%) just to cover fees and earn a small profit.
          </div>
        </div>
      </DocCard>

      {/* ── 4. Trading Signals ── */}
      <SectionHeader icon={Zap} title="4. Trading Signals" id="trading-signals" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Signals are generated in real-time by comparing the current BTC price against the calculated band boundaries. The system produces three possible signals:
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div
            className="p-3 rounded-sm text-center"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-accent-buy)" }}>BUY</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Price has touched or fallen below the lower band
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              price {"<="} lowerBand
            </div>
          </div>
          <div
            className="p-3 rounded-sm text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-accent-sell)" }}>SELL</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Price has touched or risen above the upper band
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              price {">="} upperBand
            </div>
          </div>
          <div
            className="p-3 rounded-sm text-center"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>HOLD</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Price is within the band boundaries
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              lowerBand {"<"} price {"<"} upperBand
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          The Dashboard page shows a visual band position indicator — a horizontal bar with buy (green) and sell (red) zones, and a marker showing where the current price sits within the band. The signal badge updates in real-time with each refresh cycle.
        </p>
      </DocCard>

      {/* ── 5. Backtest Engine ── */}
      <SectionHeader icon={Target} title="5. Backtest Engine" id="backtest-engine" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The backtest engine simulates the complete trading strategy over historical price data. It walks through each candle sequentially, maintaining a sliding window to calculate bands, and executes trades when signals are generated — exactly as the live system would.
        </p>

        <div className="data-label mb-2">Algorithm</div>
        <CodeBlock>{`FOR each candle from index=windowSize to end:
    window = prices[i-windowSize ... i-1]
    bands  = calculateBands(window, currentPrice, k)

    IF not inPosition AND signal == "buy":
        ENTER position at currentPrice

    IF inPosition:
        targetPrice = entryPrice * (1 + targetGainPct / 100)
        IF currentPrice >= targetPrice OR signal == "sell":
            EXIT position
            Record: entry/exit price, P&L, fees, holding time
            Update equity curve and drawdown tracking`}</CodeBlock>

        <div className="data-label mt-4 mb-2">Output Metrics</div>
        <div className="space-y-2">
          {[
            { name: "Win Rate", desc: "Percentage of trades with positive net P&L after all fees" },
            { name: "Total Trades", desc: "Number of completed round-trip trades (entries + exits)" },
            { name: "Net Profit", desc: "Sum of all net P&L values (gross profit minus all fees)" },
            { name: "Max Drawdown", desc: "Largest peak-to-trough equity decline as a percentage of peak equity" },
            { name: "Sharpe Ratio", desc: "Risk-adjusted return metric: (mean return / std of returns) * sqrt(n). Assumes risk-free rate = 0" },
            { name: "Profit Factor", desc: "Ratio of total profits from winning trades to total losses from losing trades. >1.0 is profitable" },
            { name: "Avg Hold Time", desc: "Mean duration between entry and exit across all trades, in minutes" },
          ].map((m) => (
            <div key={m.name} className="flex items-start gap-3 py-1">
              <span className="text-xs font-medium w-28 flex-shrink-0" style={{ color: "var(--color-accent-neutral)" }}>
                {m.name}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {m.desc}
              </span>
            </div>
          ))}
        </div>

        <div
          className="p-3 rounded-sm mt-4"
          style={{ background: "var(--color-bg-surface)" }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
            Edge Case Handling
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            If a position is still open at the end of the backtest period, it is force-closed at the last available price. This ensures the equity curve is complete and all metrics reflect the full strategy performance. Positions must have at least 1 minute of holding time.
          </div>
        </div>
      </DocCard>

      {/* ── 6. Grid Search Optimizer ── */}
      <SectionHeader icon={Activity} title="6. Grid Search Optimizer" id="grid-search" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The Analytics page includes an exhaustive parameter search that runs the backtest engine across a 5x5 grid of window sizes and band multipliers — 25 total combinations. Each cell shows the net profit for that parameter pair, and the best-performing combination is highlighted.
        </p>

        <div className="data-label mb-2">Search Space</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-sm" style={{ background: "var(--color-bg-surface)" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
              Window Sizes
            </div>
            <div className="flex gap-2">
              {[12, 24, 48, 72, 96].map((w) => (
                <span key={w} className="text-[10px] px-1.5 py-0.5 rounded-sm" style={{ background: "var(--color-bg-elevated)", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
                  {w}h
                </span>
              ))}
            </div>
            <div className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
              From half-day to 4-day lookback
            </div>
          </div>
          <div className="p-3 rounded-sm" style={{ background: "var(--color-bg-surface)" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
              Band Multipliers (k)
            </div>
            <div className="flex gap-2">
              {[1.0, 1.5, 2.0, 2.5, 3.0].map((k) => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded-sm" style={{ background: "var(--color-bg-elevated)", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
                  {k}
                </span>
              ))}
            </div>
            <div className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
              From tight (1.0) to very wide (3.0)
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Each cell in the grid is color-coded: green intensity represents profitable combinations (darker = more profit), red intensity represents losses. The best parameter pair is highlighted with a green border and also displayed as a badge above the grid. The grid uses your current fee and investment settings so results reflect your actual trading costs.
        </p>
      </DocCard>

      {/* ── 7. Configuration Parameters ── */}
      <SectionHeader icon={Settings} title="7. Configuration Parameters" id="config-params" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          All parameters are adjustable from the Settings page using sliders. Changes are persisted to the database and immediately reflected in band calculations, fee computations, and backtest results.
        </p>

        <div className="data-label mb-2">Band Parameters</div>
        <ParamRow name="windowHours" type="number" defaultVal="48" description="Lookback window for mean/std calculation. In hours of hourly candles. Range: 6-168h (6h to 7 days). Smaller windows react faster to price changes but generate more noise." />
        <ParamRow name="bandMultiplier" type="number" defaultVal="2.0" description="Multiplier k for band width. upperBand = mean + k*std, lowerBand = mean - k*std. Range: 0.5-5.0. Standard Bollinger uses 2.0." />
        <ParamRow name="profitMarginPct" type="number" defaultVal="0.15" description="Desired profit margin above break-even. Added to min spread to calculate target sell price. Range: 0-2%." />

        <div className="section-divider" />

        <div className="data-label mb-2">Fee Configuration</div>
        <ParamRow name="useBnbDiscount" type="boolean" defaultVal="false" description="Toggle BNB fee discount. When enabled, overrides maker/taker fees to 0.075% each (Binance discount for holding BNB)." />
        <ParamRow name="makerFeePct" type="number" defaultVal="0.1" description="Maker fee percentage charged on limit order entry. Binance default: 0.1%. With BNB: 0.075%." />
        <ParamRow name="takerFeePct" type="number" defaultVal="0.1" description="Taker fee percentage charged on market/stop order exit. Binance default: 0.1%. With BNB: 0.075%." />
        <ParamRow name="withdrawalFeeBtc" type="number" defaultVal="0.0002" description="BTC withdrawal fee on Binance. Fixed at 0.0002 BTC regardless of amount. ~$15.50 at $77,500." />
        <ParamRow name="investmentAmount" type="number" defaultVal="1000" description="Position size in USD. Used to calculate fee amounts and target prices. Range: $100-$100,000." />
      </DocCard>

      {/* ── 8. API Reference ── */}
      <SectionHeader icon={Server} title="8. API Reference (tRPC Routers)" id="api-reference" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The backend exposes type-safe tRPC procedures at <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>/api/trpc/*</span>. All endpoints are public queries (no authentication required in the current deployment). The Hono server handles tRPC requests and serves the built React frontend.
        </p>

        <div className="space-y-4">
          {[
            {
              name: "band",
              procedures: [
                { proc: "band.getConfig", type: "query", desc: "Fetch band configuration for a user. Returns all parameters." },
                { proc: "band.updateConfig", type: "mutation", desc: "Update one or more band parameters. Applies BNB discount if enabled." },
                { proc: "band.calculate", type: "query", desc: "Calculate bands for a given symbol, window, and k value. Returns mean, std, upperBand, lowerBand, signal." },
                { proc: "band.fullState", type: "query", desc: "Single query returning config + calculated bands + fee breakdown + last 100 chart prices. Powers the Dashboard." },
              ],
            },
            {
              name: "market",
              procedures: [
                { proc: "market.currentPrice", type: "query", desc: "Latest price snapshot with OHLCV data." },
                { proc: "market.history", type: "query", desc: "Price history for the last N hours. Returns time, price, open, high, low, volume." },
                { proc: "market.allPrices", type: "query", desc: "All stored price snapshots for backtesting." },
                { proc: "market.syncPrices", type: "query", desc: "Sync kline data from Binance data source." },
                { proc: "market.syncFromTicker", type: "query", desc: "Insert current ticker price as a snapshot." },
              ],
            },
            {
              name: "fee",
              procedures: [
                { proc: "fee.calculate", type: "query", desc: "Fee breakdown for given parameters. Returns maker/taker/withdrawal fees, min spread, target gain." },
                { proc: "fee.withUserConfig", type: "query", desc: "Fee breakdown using saved user configuration." },
              ],
            },
            {
              name: "trade",
              procedures: [
                { proc: "trade.list", type: "query", desc: "List recent trades for a symbol. Sorted by most recent." },
                { proc: "trade.openPosition", type: "mutation", desc: "Open a new paper trade (BUY) with entry price and quantity." },
                { proc: "trade.closePosition", type: "mutation", desc: "Close an open trade with exit price and P&L calculation." },
                { proc: "trade.getOpen", type: "query", desc: "Get the currently open trade for a symbol, if any." },
                { proc: "trade.stats", type: "query", desc: "Aggregate trade statistics for a symbol." },
                { proc: "trade.simulate", type: "query", desc: "Simulate a trade with given entry/exit prices. Returns projected P&L without recording." },
              ],
            },
            {
              name: "backtest",
              procedures: [
                { proc: "backtest.run", type: "query", desc: "Run a full backtest with current or custom parameters. Returns up to 100 trades plus aggregate metrics." },
                { proc: "backtest.gridSearch", type: "query", desc: "Run 25 backtests across the parameter grid. Returns each cell's net profit, win rate, trades, Sharpe, and the best parameters." },
              ],
            },
          ].map((router) => (
            <div key={router.name}>
              <div className="data-label mb-1">{router.name}Router</div>
              {router.procedures.map((p) => (
                <div
                  key={p.proc}
                  className="flex items-start gap-3 py-1.5"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-sm flex-shrink-0 mt-0.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: p.type === "mutation" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                      color: p.type === "mutation" ? "var(--color-accent-sell)" : "var(--color-accent-neutral)",
                    }}
                  >
                    {p.type}
                  </span>
                  <span className="text-xs font-medium flex-shrink-0" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", minWidth: 180 }}>
                    {p.proc}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {p.desc}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DocCard>

      {/* ── 9. Database Schema ── */}
      <SectionHeader icon={Database} title="9. Database Schema (MySQL)" id="database-schema" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The database uses MySQL via Drizzle ORM with PlanetScale-compatible mode. Five tables power the entire application. The database is pre-seeded with 720 hourly BTC/USDT price snapshots from the past 30 days of real Binance data.
        </p>

        {[
          {
            name: "users",
            desc: "User accounts managed via Kimi OAuth. Tracks union ID, name, email, avatar, and role (user/admin). The OWNER_UNION_ID env var grants admin role on first login.",
            cols: ["id (PK)", "unionId (unique)", "name", "email", "avatar", "role (user|admin)", "createdAt", "updatedAt", "lastSignInAt"],
          },
          {
            name: "price_snapshots",
            desc: "Historical hourly BTC/USDT prices from Binance. Each row is one candle with OHLCV data. Used for band calculation and backtesting. Currently holds 720 rows (30 days x 24 hours).",
            cols: ["id (PK)", "symbol (BTCUSDT)", "price (close)", "open", "high", "low", "volume", "closeTime", "createdAt"],
          },
          {
            name: "band_configs",
            desc: "Per-user trading band configuration. All parameters from the Settings page are stored here. Currently one default config (userId=1). Upserted on save.",
            cols: ["id (PK)", "userId", "symbol", "windowHours", "bandMultiplier", "profitMarginPct", "useBnbDiscount", "makerFeePct", "takerFeePct", "withdrawalFeeBtc", "investmentAmount", "createdAt", "updatedAt"],
          },
          {
            name: "trades",
            desc: "Paper trade records. Each trade tracks entry/exit prices, fees, P&L, and status. Open trades are awaiting exit; closed trades have final P&L calculated.",
            cols: ["id (PK)", "symbol", "side (buy|sell)", "entryPrice", "exitPrice", "targetPrice", "quantity", "makerFee", "takerFee", "withdrawalFee", "grossPnl", "netPnl", "status (open|closed|cancelled)", "enteredAt", "exitedAt", "holdingMinutes"],
          },
          {
            name: "performance_logs",
            desc: "Daily aggregated performance snapshots. Designed for tracking win rate, fee totals, and net profit over time. Populated by scheduled aggregation.",
            cols: ["id (PK)", "symbol", "date", "totalTrades", "winningTrades", "losingTrades", "totalFees", "grossProfit", "netProfit", "avgHoldingMinutes", "maxDrawdownPct", "winRatePct", "createdAt"],
          },
        ].map((table) => (
          <div key={table.name} className="mb-4">
            <div
              className="text-xs font-semibold mb-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}
            >
              {table.name}
            </div>
            <div className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
              {table.desc}
            </div>
            <div className="flex flex-wrap gap-1">
              {table.cols.map((col) => (
                <span
                  key={col}
                  className="text-[10px] px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: "var(--color-bg-surface)",
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        ))}
      </DocCard>

      {/* ── 10. Pages Guide ── */}
      <SectionHeader icon={BarChart3} title="10. Pages Guide" id="pages-guide" />
      <DocCard>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4" style={{ color: "var(--color-accent-neutral)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Dashboard (/)
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
              The main monitoring view. All data is fetched in a single <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>band.fullState</span> query for optimal performance.
            </p>
            <ul className="space-y-1 ml-6">
              {[
                "Price Hero — current BTC/USDT price with live band position indicator and active signal badge",
                "Band Position Visualizer — horizontal bar showing price location within buy/sell zones with band boundaries",
                "Interactive Price Chart — ComposedChart (Recharts) with price line, upper/lower bands (dashed), mean line, and band fill area. Time range selector: 6H, 12H, 24H, 48H, 7D",
                "Fee Breakdown Panel — itemized maker, taker, and withdrawal fees in USD with percentages",
                "Fee Composition Bar — stacked horizontal bar showing the proportion of each fee component relative to target gain",
                "Threshold Visualizer — minimum spread and recommended target with break-even price",
                "Trade History Table — recent trades with entry/exit prices, holding time, gross P&L, fees, net P&L, and status badges",
                "Backtest Summary — six key metrics (win rate, trades, hold time, net profit, max drawdown, Sharpe ratio)",
              ].map((item) => (
                <li key={item} className="text-xs flex items-start gap-2" style={{ color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-accent-band-line)" }}>-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="section-divider" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4" style={{ color: "var(--color-accent-neutral)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Analytics (/analytics)
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Parameter optimization and trade analysis. Designed for finding the best strategy configuration.
            </p>
            <ul className="space-y-1 ml-6">
              {[
                "Optimal Parameter Search — 5x5 grid (25 combinations) of window hours x band multiplier. Each cell shows net profit ($), color-coded green (profit) or red (loss). Best combination highlighted with badge",
                "Simulated Trade P&L — bar chart showing net P&L for each individual backtest trade. Green bars = wins, red bars = losses",
                "Fee Impact Analysis — cumulative line chart tracking gross profit, cumulative fees, and net profit over successive trades. Shows how fees erode returns over time",
              ].map((item) => (
                <li key={item} className="text-xs flex items-start gap-2" style={{ color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-accent-band-line)" }}>-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="section-divider" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" style={{ color: "var(--color-accent-neutral)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Settings (/settings)
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
              All tunable parameters with instant save. Changes propagate immediately to Dashboard and Analytics via tRPC query invalidation.
            </p>
            <ul className="space-y-1 ml-6">
              {[
                "Band Parameters — window size (6-168h), band multiplier k (0.5-5.0), profit margin (0-2%)",
                "Fee Configuration — BNB discount toggle, maker fee %, taker fee %, withdrawal fee (BTC), investment amount ($100-$100,000)",
                "Save Changes — persists to band_configs table and invalidates all relevant queries",
                "Reset Defaults — reverts all parameters to factory values",
              ].map((item) => (
                <li key={item} className="text-xs flex items-start gap-2" style={{ color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "var(--color-accent-band-line)" }}>-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DocCard>

      {/* ── 11. Architecture ── */}
      <SectionHeader icon={Cpu} title="11. Architecture" id="architecture" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Bandit uses a co-located full-stack architecture where the React frontend and Hono/tRPC backend share the same codebase and are served from a single Node.js process.
        </p>

        <CodeBlock>{`Request Flow:

  Browser
    |
    v
  nginx (SSL termination, reverse proxy)
    |
    v
  Hono Server (port 3000)
    |
    +-- /api/trpc/* --> tRPC Fetch Adapter --> Router
    |                                        |
    |                   +-- bandRouter    (bands, config, fullState)
    |                   +-- marketRouter  (prices, sync)
    |                   +-- feeRouter     (fee calculation)
    |                   +-- tradeRouter   (CRUD, simulate)
    |                   +-- backtestRouter (run, gridSearch)
    |                                        |
    |                                   Drizzle ORM
    |                                        |
    |                                    MySQL 8
    |
    +-- /* --> Static File Server (dist/public/)
                    |
                    index.html + JS + CSS (React SPA)`}</CodeBlock>

        <div className="data-label mt-4 mb-2">Technology Stack</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { layer: "Frontend", tech: "React 19 + TypeScript" },
            { layer: "Build", tech: "Vite 7 + esbuild" },
            { layer: "UI", tech: "Tailwind CSS + shadcn/ui (40+ components)" },
            { layer: "Charts", tech: "Recharts (ComposedChart, BarChart, LineChart)" },
            { layer: "API Layer", tech: "tRPC 11 (end-to-end type safety)" },
            { layer: "Server", tech: "Hono 4 (Node.js)" },
            { layer: "ORM", tech: "Drizzle ORM 0.45 (MySQL, planetscale mode)" },
            { layer: "Database", tech: "MySQL 8" },
            { layer: "Auth", tech: "Kimi OAuth (Jose JWT)" },
            { layer: "Deployment", tech: "nginx + Let's Encrypt SSL" },
          ].map((row) => (
            <div key={row.layer} className="flex items-center gap-2">
              <span className="text-xs font-medium w-16" style={{ color: "var(--color-text-muted)" }}>
                {row.layer}
              </span>
              <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
                {row.tech}
              </span>
            </div>
          ))}
        </div>

        <div className="data-label mt-4 mb-2">Production Build</div>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          The build process runs two steps: first, Vite builds the React frontend into <span style={{ fontFamily: "var(--font-mono)" }}>dist/public/</span> (HTML, JS, CSS). Then esbuild bundles the backend (<span style={{ fontFamily: "var(--font-mono)" }}>api/boot.ts</span>) into <span style={{ fontFamily: "var(--font-mono)" }}>dist/boot.js</span> as a single ESM file with a CJS compatibility banner. At runtime, Hono serves the API routes and falls back to static file serving for the SPA.
        </p>
      </DocCard>

      {/* ── 12. Auto-Refresh ── */}
      <SectionHeader icon={Activity} title="12. Auto-Refresh & Real-Time Updates" id="auto-refresh" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          The dashboard uses tRPC's <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>refetchInterval</span> option on queries to automatically poll for updated data:
        </p>
        <CodeBlock>{`// Dashboard — every 30 seconds
trpc.band.fullState.useQuery({ symbol: "BTCUSDT" }, { refetchInterval: 30000 });

// Trade list — every 30 seconds
trpc.trade.list.useQuery({ symbol: "BTCUSDT" }, { refetchInterval: 30000 });

// Backtest summary — every 60 seconds
trpc.backtest.run.useQuery({ symbol: "BTCUSDT" }, { refetchInterval: 60000 });`}</CodeBlock>
        <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
          When settings are saved, the mutation's <span style={{ fontFamily: "var(--font-mono)" }}>onSuccess</span> handler invalidates all dependent queries, triggering an immediate refetch. This means band calculations, fee breakdowns, backtest results, and grid search all update instantly after a configuration change — no page reload needed.
        </p>
      </DocCard>

      <div className="mt-8 text-center">
        <span
          className="text-[10px]"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
        >
          Bandit v8335440 — BTC Mean Reversion Arbitrage Dashboard
        </span>
      </div>
    </div>
  );
}
