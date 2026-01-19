"use server";

const BASE_URL = process.env.BINANCE_BASE_URL;

// if (!BASE_URL) {
//   throw new Error("BINANCE_BASE_URL is not defined");
// }

export async function getBinanceSymbols(): Promise<Set<string>> {
  if (!BASE_URL) {
    console.warn("BINANCE_BASE_URL is not defined in environment variables. Skipping Binance symbol fetch.");
    return new Set();
  }

  try {
    const res = await fetch(`${BASE_URL}/exchangeInfo`, {
      next: { revalidate: 60 * 60 }, // cache 1 hour
    });

    if (!res.ok) {
      console.warn(`Failed to fetch binance symbols: ${res.status} ${res.statusText}`);
      return new Set();
    }

    const data: BinanceExchangeInfoResponse = await res.json();
    return new Set(data.symbols.filter((s) => s.quoteAsset === "USDT" && s.status === "TRADING").map((s) => s.symbol));
  } catch (error) {
    console.error("Error fetching binance symbols:", error);
    return new Set();
  }
}
