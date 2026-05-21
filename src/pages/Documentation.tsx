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
          v2025.05
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
          <strong style={{ color: "var(--color-text-primary)" }}>Bandit</strong> is a BTC Mean Reversion Dashboard that trades the constant oscillation of Bitcoin's price in calm markets. Rather than betting on crashes or bull runs, Bandit profits from the natural noise — buying when price dips below the lower Bollinger Band and selling when it returns to the upper band.
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          A volume regime filter automatically suppresses signals during high-volume events (crashes, pumps, breakouts) where mean reversion fails, and during very low-volume periods where price action is too random. The sweet spot is normal volume — the boring, sideways oscillation that happens most of the time.
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
              "1-minute candle resolution with 200k+ rows of real Binance data",
              "Rolling 48h Bollinger Bands calculated server-side per candle",
              "Volume regime detection: calm (ranging), normal, spike (trending)",
              "Signal suppression during volume spikes — stay out of crashes and bull runs",
              "Browser-side SQLite (sql.js WASM) with IndexedDB persistence",
              "Full backtest engine with Sharpe ratio, max drawdown, profit factor",
              "Fee-aware break-even calculation (maker, taker, withdrawal)",
              "Incremental sync every 20s — only new data transferred",
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
          Bands are calculated server-side using a rolling 48-hour window of 1-minute candles (2,880 data points). For each candle, the server computes the mean and standard deviation of all prices in the trailing window, then applies the Bollinger multiplier to define upper and lower boundaries. This means bands change at every point on the chart — they're not flat lines.
        </p>

        <div className="data-label mb-2">Band Calculation</div>
        <Formula
          label="Mean (rolling)"
          formula="mean = (1/n) * sum(prices in window)"
          description="Simple arithmetic mean over the trailing 2,880 one-minute candles"
        />
        <Formula
          label="Standard Deviation"
          formula="std = sqrt( (1/n) * sum((price - mean)^2) )"
          description="Population standard deviation of prices in the window"
        />
        <Formula
          label="Upper Band"
          formula="upperBand = mean + k * std"
          description="Sell threshold: price above this is overbought"
        />
        <Formula
          label="Lower Band"
          formula="lowerBand = mean - k * std"
          description="Buy threshold: price below this is oversold"
        />
        <Formula
          label="Volume Ratio"
          formula="volumeRatio = currentVolume / avgVolume(window)"
          description="Used to detect market regime. Ratio > 2x = spike (trending), less than 0.5x = calm (ranging)"
        />

        <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
          The multiplier <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>k</span> defaults to 2.0, capturing ~95.4% of price action. All calculations happen server-side and the pre-computed values are sent to the browser — no client-side math needed.
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
      <SectionHeader icon={Zap} title="4. Trading Signals & Strategy" id="trading-signals" />
      <DocCard>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>
          Bandit uses a volume-filtered mean reversion strategy. The goal is to profit from Bitcoin's constant oscillation — not to bet on directional moves.
        </p>

        <div className="data-label mb-2">The Strategy</div>
        <div
          className="p-3 rounded-sm mb-4"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "var(--color-text-primary)" }}>Buy</strong> when price crosses below the lower band (oversold in a calm market).<br />
            <strong style={{ color: "var(--color-text-primary)" }}>Sell</strong> when price crosses above the upper band (overbought) or reaches the fee-adjusted target.<br />
            <strong style={{ color: "var(--color-text-primary)" }}>Stay out</strong> when volume spikes above 2x average — this means a crash or pump is happening and mean reversion will fail.
          </div>
        </div>

        <div className="data-label mb-2">Signal Types</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="p-3 rounded-sm"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-accent-buy)" }}>BUY</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Price fell below lower band AND volume is normal. The price is expected to revert upward toward the mean.
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              price {"<="} lowerBand AND volRatio {"<"} 2.0
            </div>
          </div>
          <div
            className="p-3 rounded-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-accent-sell)" }}>SELL</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Price rose above upper band AND volume is normal. The price is expected to revert downward toward the mean.
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              price {">="} upperBand AND volRatio {"<"} 2.0
            </div>
          </div>
          <div
            className="p-3 rounded-sm"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>HOLD</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Price is within the bands. No action needed — wait for the next signal.
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              lowerBand {"<"} price {"<"} upperBand
            </div>
          </div>
          <div
            className="p-3 rounded-sm"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-accent-fee)" }}>SKIP</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Volume spike detected ({">"}2x average). A crash or bull run is likely underway. Do not trade mean reversion here.
            </div>
            <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
              volRatio {">="} 2.0
            </div>
          </div>
        </div>

        <div className="data-label mb-2">Volume Regime</div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-2 rounded-sm" style={{ background: "var(--color-bg-surface)", borderLeft: "3px solid var(--color-accent-buy)" }}>
            <div className="text-xs font-medium" style={{ color: "var(--color-accent-buy)" }}>Calm (Ranging)</div>
            <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>volRatio {"<"} 0.5x</div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>Low volume, price oscillates. Safe to trade.</div>
          </div>
          <div className="p-2 rounded-sm" style={{ background: "var(--color-bg-surface)", borderLeft: "3px solid var(--color-accent-neutral)" }}>
            <div className="text-xs font-medium" style={{ color: "var(--color-accent-neutral)" }}>Normal</div>
            <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>0.5x - 2.0x</div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>Typical activity. Signals active.</div>
          </div>
          <div className="p-2 rounded-sm" style={{ background: "var(--color-bg-surface)", borderLeft: "3px solid var(--color-accent-sell)" }}>
            <div className="text-xs font-medium" style={{ color: "var(--color-accent-sell)" }}>Spike (Trending)</div>
            <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>volRatio {">"} 2.0x</div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>Crash or bull run. Stay out.</div>
          </div>
        </div>

        <div className="data-label mb-2">Why This Works</div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Bitcoin spends roughly 70% of its time in low-to-moderate volume ranging periods — bouncing between support and resistance without a clear directional trend. During these periods, Bollinger Bands reliably capture the oscillation range. The remaining 30% of the time (high-volume events: liquidation cascades, whale moves, exchange news), mean reversion strategies fail because price trends hard in one direction. The volume filter detects these events and suppresses trading signals, protecting you from catching falling knives or selling into a rally.
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
          The backend exposes type-safe tRPC procedures at <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>/api/trpc/*</span> and a dedicated bulk data endpoint at <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>/api/sync/prices</span> for the browser-side SQLite sync.
        </p>

        <div className="data-label mb-2">Sync Endpoint (Non-tRPC)</div>
        <div
          className="p-2 rounded-sm mb-4"
          style={{ background: "var(--color-bg-surface)", borderLeft: "3px solid var(--color-accent-buy)" }}
        >
          <div className="text-xs font-medium" style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-buy)" }}>GET /api/sync/prices</div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Returns pre-calculated Bollinger Bands and volume data as compact JSON arrays. Accepts <span style={{ fontFamily: "var(--font-mono)" }}>after</span> (timestamp) for incremental sync. When after=0, returns all 200k+ rows with server-side band computation (~2.9MB). When after&gt;0, returns only new rows with lookback context for accurate bands.
          </div>
          <div className="text-[10px] mt-1" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
            Response: [[timestamp, price, mean, upperBand, lowerBand, volume, avgVolume], ...]
          </div>
        </div>

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
            desc: "Historical 1-minute BTC/USDT candles from Binance. Each row is one candle with OHLCV data. Currently holds 200k+ rows (Jan-May 2026). Used for server-side band calculation and backtesting.",
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
              The main monitoring view. Live price, bands, and signals are read from the browser's local SQLite database (synced every 20s). Fees and backtest come from tRPC.
            </p>
            <ul className="space-y-1 ml-6">
              {[
                "Price Hero — live BTC/USDT price from local SQLite, band position indicator, signal badge, and volume regime status",
                "Volume Regime — shows Calm (ranging, safe to trade), Normal, or Spike (trending, stay out)",
                "Interactive Price Chart — price line, upper/lower bands, mean, and volume bars with dual Y-axis. Range selector: 6H, 12H, 24H, 48H, 14D, 1M",
                "Fee Breakdown Panel — itemized maker, taker, and withdrawal fees in USD with percentages",
                "Fee Composition Bar — stacked horizontal bar showing proportion of each fee component",
                "Threshold Visualizer — minimum spread, recommended target, break-even price",
                "Trade History Table — recent trades with entry/exit, holding time, P&L, fees, status",
                "Backtest Summary — win rate, total trades, avg hold time, net profit, max drawdown, Sharpe ratio",
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
    +-- /api/sync/prices --> Bollinger Bands + Volume (server-side calc)
    |       |
    |       +-- Initial: all 200k rows with pre-computed bands (~2.9MB)
    |       +-- Incremental: new rows only (every 20s from browser)
    |
    +-- /api/trpc/* --> tRPC Fetch Adapter --> Router
    |                                        |
    |                   +-- bandRouter    (config, fullState, fees)
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
                    index.html + JS + CSS + sql-wasm.wasm (React SPA)

  Browser-Side Data Flow:
    sql.js (WASM SQLite) <--> IndexedDB (persisted across sessions)
         |
         +-- getLatest() --> Hero: price, bands, signal, volume regime
         +-- queryChart() --> Price chart with bands and volume bars`}</CodeBlock>

        <div className="data-label mt-4 mb-2">Technology Stack</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { layer: "Frontend", tech: "React 19 + TypeScript" },
            { layer: "Build", tech: "Vite 7 + esbuild" },
            { layer: "UI", tech: "Tailwind CSS + shadcn/ui" },
            { layer: "Charts", tech: "Recharts (ComposedChart)" },
            { layer: "Local DB", tech: "sql.js WASM + IndexedDB" },
            { layer: "API Layer", tech: "tRPC 11 (type-safe)" },
            { layer: "Server", tech: "Hono 4 (Node.js)" },
            { layer: "ORM", tech: "Drizzle ORM (MySQL)" },
            { layer: "Database", tech: "MySQL 8" },
            { layer: "Data Source", tech: "Binance REST API (1m klines)" },
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
          Bandit uses a two-layer data architecture. The browser maintains a local SQLite database (persisted in IndexedDB) that syncs incrementally from the server every 20 seconds. This means the chart, price, and signals update without hitting tRPC.
        </p>

        <div className="data-label mb-2">Browser-Side Sync (Every 20s)</div>
        <CodeBlock>{`// First visit: download all data with progress bar
GET /api/sync/prices?after=0
// Returns: [[timestamp, price, mean, upperBand, lowerBand, volume, avgVolume], ...]
// ~200k rows, ~2.9MB, one-time download

// Return visits: restore from IndexedDB, then fetch only new rows
GET /api/sync/prices?after=<lastTimestamp>
// Server recalculates bands for new rows with lookback context`}</CodeBlock>

        <div className="data-label mt-4 mb-2">Server-Side Binance Sync</div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-sm" style={{ background: "var(--color-bg-surface)", borderLeft: "3px solid var(--color-accent-buy)" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--color-accent-buy)" }}>
              1m Klines — Every 60 seconds
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Fetches the latest 5 one-minute candles from Binance. Only inserts candles newer than the latest row in the database.
            </div>
          </div>
          <div className="p-3 rounded-sm" style={{ background: "var(--color-bg-surface)", borderLeft: "3px solid var(--color-accent-neutral)" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--color-accent-neutral)" }}>
              Ticker — Every 20 seconds
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Current spot price from Binance's 24hr ticker. Inserts only if no snapshot was recorded in the last 60 seconds.
            </div>
          </div>
        </div>

        <div className="data-label mt-4 mb-2">tRPC Refresh (Server Data)</div>
        <div className="space-y-1">
          <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>band.fullState</span> — fees, config (every 60s)
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>trade.list</span> — trade history (every 30s)
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent-neutral)" }}>backtest.run</span> — backtest metrics (every 60s)
          </div>
        </div>
      </DocCard>

      <div className="mt-8 text-center">
        <span
          className="text-[10px]"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
        >
          Bandit v2025.05 — BTC Mean Reversion Dashboard
        </span>
      </div>
    </div>
  );
}
