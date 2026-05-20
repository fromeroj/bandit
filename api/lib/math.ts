/**
 * Statistical band calculation and fee optimization utilities
 */

export interface BandResult {
  mean: number;
  std: number;
  upperBand: number;
  lowerBand: number;
  bandWidth: number;
  bandWidthPct: number;
  signal: "buy" | "sell" | "hold";
  currentPrice?: number;
  dataPoints?: number;
}

export interface FeeBreakdown {
  makerFeePct: number;
  takerFeePct: number;
  withdrawalFeeBtc: number;
  withdrawalFeeUsd: number;
  makerFeeUsd: number;
  takerFeeUsd: number;
  totalFeesUsd: number;
  minSpreadUsd: number;
  minSpreadPct: number;
  targetGainPct: number;
  targetGainUsd: number;
  targetSellPrice: number;
}

export interface BacktestTrade {
  entryTime: string;
  entryPrice: number;
  exitTime: string;
  exitPrice: number;
  holdingMinutes: number;
  grossPnl: number;
  totalFees: number;
  netPnl: number;
  status: "win" | "loss" | "breakeven";
}

export interface BacktestResult {
  trades: BacktestTrade[];
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRatePct: number;
  totalGrossProfit: number;
  totalFees: number;
  totalNetProfit: number;
  avgHoldingMinutes: number;
  avgProfitPerTrade: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  profitFactor: number;
}

/**
 * Calculate Bollinger-style statistical bands
 */
export function calculateBands(
  prices: number[],
  currentPrice: number,
  k: number = 2.0
): BandResult {
  if (prices.length < 2) {
    return {
      mean: currentPrice,
      std: 0,
      upperBand: currentPrice * 1.02,
      lowerBand: currentPrice * 0.98,
      bandWidth: currentPrice * 0.04,
      bandWidthPct: 4,
      signal: "hold",
    };
  }

  // Filter outliers beyond 3 std
  const filtered = filterOutliers(prices);

  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const variance =
    filtered.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) /
    filtered.length;
  const std = Math.sqrt(variance);

  const upperBand = mean + k * std;
  const lowerBand = mean - k * std;
  const bandWidth = upperBand - lowerBand;
  const bandWidthPct = (bandWidth / mean) * 100;

  let signal: "buy" | "sell" | "hold" = "hold";
  if (currentPrice <= lowerBand) signal = "buy";
  else if (currentPrice >= upperBand) signal = "sell";

  return { mean, std, upperBand, lowerBand, bandWidth, bandWidthPct, signal };
}

/**
 * Filter outliers beyond 3 standard deviations
 */
function filterOutliers(prices: number[]): number[] {
  if (prices.length < 10) return prices;
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance =
    prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  const std = Math.sqrt(variance);
  const threshold = 3 * std;
  return prices.filter((p) => Math.abs(p - mean) <= threshold);
}

/**
 * Calculate fee breakdown and optimal threshold
 */
export function calculateFeeBreakdown(
  currentPrice: number,
  investmentAmount: number,
  makerFeePct: number,
  takerFeePct: number,
  withdrawalFeeBtc: number,
  profitMarginPct: number
): FeeBreakdown {
  const makerFeeUsd = (investmentAmount * makerFeePct) / 100;
  const estimatedExitValue = investmentAmount; // approximate
  const takerFeeUsd = (estimatedExitValue * takerFeePct) / 100;
  const withdrawalFeeUsd = withdrawalFeeBtc * currentPrice;

  const totalFeesUsd = makerFeeUsd + takerFeeUsd + withdrawalFeeUsd;
  const minSpreadUsd = totalFeesUsd;
  const minSpreadPct = (minSpreadUsd / investmentAmount) * 100;
  const targetGainPct = minSpreadPct + profitMarginPct;
  const targetGainUsd = (investmentAmount * targetGainPct) / 100;
  const targetSellPrice = currentPrice * (1 + targetGainPct / 100);

  return {
    makerFeePct,
    takerFeePct,
    withdrawalFeeBtc,
    withdrawalFeeUsd,
    makerFeeUsd,
    takerFeeUsd,
    totalFeesUsd,
    minSpreadUsd,
    minSpreadPct,
    targetGainPct,
    targetGainUsd,
    targetSellPrice,
  };
}

/**
 * Run backtest over historical data
 */
export function runBacktest(
  prices: { close: number; closeTime: Date }[],
  windowSize: number,
  k: number,
  makerFeePct: number,
  takerFeePct: number,
  withdrawalFeeBtc: number,
  profitMarginPct: number,
  investmentAmount: number
): BacktestResult {
  const trades: BacktestTrade[] = [];
  let inPosition = false;
  let entryPrice = 0;
  let entryTime = "";
  let currentEquity = investmentAmount;
  let peakEquity = investmentAmount;
  let maxDrawdownPct = 0;

  for (let i = windowSize; i < prices.length; i++) {
    const window = prices.slice(i - windowSize, i).map((p) => p.close);
    const current = prices[i];
    const bands = calculateBands(window, current.close, k);

    if (!inPosition && bands.signal === "buy") {
      inPosition = true;
      entryPrice = current.close;
      entryTime = current.closeTime.toISOString();
    } else if (inPosition) {
      const fees = calculateFeeBreakdown(
        entryPrice,
        investmentAmount,
        makerFeePct,
        takerFeePct,
        withdrawalFeeBtc,
        profitMarginPct
      );
      const targetPrice = entryPrice * (1 + fees.targetGainPct / 100);

      if (current.close >= targetPrice || bands.signal === "sell") {
        const exitPrice = current.close;
        const grossPnl =
          ((exitPrice - entryPrice) / entryPrice) * investmentAmount;
        const makerFee = (investmentAmount * makerFeePct) / 100;
        const takerFee = (investmentAmount * takerFeePct) / 100;
        const withdrawalFee = withdrawalFeeBtc * exitPrice;
        const totalFees = makerFee + takerFee + withdrawalFee;
        const netPnl = grossPnl - totalFees;

        const holdingMinutes = Math.round(
          (new Date(current.closeTime).getTime() -
            new Date(entryTime).getTime()) /
            60000
        );

        let status: "win" | "loss" | "breakeven" = "breakeven";
        if (netPnl > 0) status = "win";
        else if (netPnl < 0) status = "loss";

        trades.push({
          entryTime: entryTime,
          entryPrice,
          exitTime: current.closeTime.toISOString(),
          exitPrice,
          holdingMinutes: Math.max(1, holdingMinutes),
          grossPnl,
          totalFees,
          netPnl,
          status,
        });

        currentEquity += netPnl;
        if (currentEquity > peakEquity) peakEquity = currentEquity;
        const drawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
        if (drawdown > maxDrawdownPct) maxDrawdownPct = drawdown;

        inPosition = false;
        entryPrice = 0;
        entryTime = "";
      }
    }
  }

  // Close any open position at the end
  if (inPosition && entryPrice > 0) {
    const lastPrice = prices[prices.length - 1];
    const grossPnl =
      ((lastPrice.close - entryPrice) / entryPrice) * investmentAmount;
    const makerFee = (investmentAmount * makerFeePct) / 100;
    const takerFee = (investmentAmount * takerFeePct) / 100;
    const withdrawalFee = withdrawalFeeBtc * lastPrice.close;
    const totalFees = makerFee + takerFee + withdrawalFee;
    const netPnl = grossPnl - totalFees;
    const holdingMinutes = Math.round(
      (new Date(lastPrice.closeTime).getTime() -
        new Date(entryTime).getTime()) /
        60000
    );

    let status: "win" | "loss" | "breakeven" = "breakeven";
    if (netPnl > 0) status = "win";
    else if (netPnl < 0) status = "loss";

    trades.push({
      entryTime: entryTime,
      entryPrice,
      exitTime: lastPrice.closeTime.toISOString(),
      exitPrice: lastPrice.close,
      holdingMinutes: Math.max(1, holdingMinutes),
      grossPnl,
      totalFees,
      netPnl,
      status,
    });
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.status === "win").length;
  const losingTrades = trades.filter((t) => t.status === "loss").length;
  const breakevenTrades = trades.filter(
    (t) => t.status === "breakeven"
  ).length;
  const winRatePct =
    totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalGrossProfit = trades.reduce((s, t) => s + t.grossPnl, 0);
  const totalFees = trades.reduce((s, t) => s + t.totalFees, 0);
  const totalNetProfit = trades.reduce((s, t) => s + t.netPnl, 0);
  const avgHoldingMinutes =
    totalTrades > 0
      ? trades.reduce((s, t) => s + t.holdingMinutes, 0) / totalTrades
      : 0;
  const avgProfitPerTrade = totalTrades > 0 ? totalNetProfit / totalTrades : 0;

  // Simplified Sharpe ratio (assuming risk-free rate = 0)
  const returns = trades.map((t) => t.netPnl);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const returnVariance =
    returns.length > 0
      ? returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) /
        returns.length
      : 0;
  const returnStd = Math.sqrt(returnVariance);
  const sharpeRatio = returnStd > 0 ? (avgReturn / returnStd) * Math.sqrt(trades.length) : 0;

  const grossWins = trades
    .filter((t) => t.netPnl > 0)
    .reduce((s, t) => s + t.netPnl, 0);
  const grossLosses = Math.abs(
    trades.filter((t) => t.netPnl < 0).reduce((s, t) => s + t.netPnl, 0)
  );
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;

  return {
    trades,
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRatePct,
    totalGrossProfit,
    totalFees,
    totalNetProfit,
    avgHoldingMinutes,
    avgProfitPerTrade,
    maxDrawdownPct,
    sharpeRatio,
    profitFactor,
  };
}

/**
 * Calculate position progress toward target
 */
export function calculatePositionProgress(
  entryPrice: number,
  currentPrice: number,
  targetPrice: number
): number {
  if (targetPrice <= entryPrice) return 0;
  const progress =
    ((currentPrice - entryPrice) / (targetPrice - entryPrice)) * 100;
  return Math.max(0, Math.min(100, progress));
}
