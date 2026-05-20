const BINANCE_BASE = "https://api.binance.com";

export interface BinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface BinanceTicker {
  symbol: string;
  price: number;
  high: number;
  low: number;
  volume: number;
}

export async function fetchBinanceKlines(
  symbol: string = "BTCUSDT",
  interval: string = "1h",
  limit: number = 100
): Promise<BinanceKline[]> {
  const url = `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance klines API error: ${res.status} ${res.statusText}`);
  }
  const data: any[][] = await res.json();

  return data.map((k) => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: k[6],
  }));
}

export async function fetchBinanceTicker(
  symbol: string = "BTCUSDT"
): Promise<BinanceTicker | null> {
  const url = `${BINANCE_BASE}/api/v3/ticker/24hr?symbol=${symbol}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance ticker API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  return {
    symbol: data.symbol,
    price: parseFloat(data.lastPrice),
    high: parseFloat(data.highPrice),
    low: parseFloat(data.lowPrice),
    volume: parseFloat(data.volume),
  };
}
