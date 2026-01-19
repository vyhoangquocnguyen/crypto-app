"use server";

const BASE_URL = process.env.BINANCE_BASE_URL;

if (!BASE_URL) {
  throw new Error("BINANCE_BASE_URL is not defined");
}

export async function getBinanceSymbols(): Promise<Set<string>> {
  const res = await fetch(`${BASE_URL}/exchangeInfo`, {
    next: { revalidate: 60 * 60 }, // cache 1 hour
  });

  if (!res.ok) {
    throw new Error("Failed to fetch binance symbols");
  }

  const data: BinanceExchangeInfoResponse = await res.json();

  return new Set(data.symbols.filter((s) => s.quoteAsset === "USDT" && s.status === "TRADING").map((s) => s.symbol));
}
