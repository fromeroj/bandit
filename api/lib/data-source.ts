import { fetchBinanceKlines, fetchBinanceTicker } from "./binance";

export async function get_data_source(
  _data_source_name: string,
  api_name: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const symbol = (params.symbol as string) || "BTCUSDT";

  try {
    if (api_name === "binance_crypto_klines") {
      const klines = await fetchBinanceKlines(
        symbol,
        (params.interval as string) || "1h",
        (params.limit as number) || 100
      );
      return {
        data: klines.map((k) => ({
          open_time: k.openTime,
          open: k.open.toString(),
          high: k.high.toString(),
          low: k.low.toString(),
          close: k.close.toString(),
          volume: k.volume.toString(),
          close_time: k.closeTime,
        })),
        error: null,
      };
    }

    if (api_name === "binance_crypto_price") {
      const ticker = await fetchBinanceTicker(symbol);
      if (!ticker) return { data: [], error: null };
      return {
        data: [
          {
            symbol: ticker.symbol,
            price: ticker.price.toString(),
            high: ticker.high.toString(),
            low: ticker.low.toString(),
            volume: ticker.volume.toString(),
          },
        ],
        error: null,
      };
    }

    return { data: [], error: `Unknown API: ${api_name}` };
  } catch (error) {
    console.error(`Data source error (${api_name}):`, error);
    return { data: [], error: String(error) };
  }
}
