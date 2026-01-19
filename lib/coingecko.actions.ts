"use server";

import qs from "query-string";
import { getBinanceSymbols } from "./binance.actions";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) {
  throw new Error("cannot get base url from env");
}

if (!API_KEY) {
  throw new Error("cannot get api key from env");
}

export async function fetcher<T>(endpoint: string, params?: QueryParams, revalidate = 60): Promise<T | null> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  try {
    const response = await fetch(url, {
      headers: {
        "x-cg-demo-api-key": API_KEY,
        "Content-Type": "application/json",
      } as Record<string, string>,
      next: { revalidate },
    });

    if (!response.ok) {
      // Log detailed error but don't crash the server component
      const errorText = await response.text();
      console.error(`API Error ${response.status} for ${url}: ${errorText}`);
      return null;
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    return null;
  }
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: "",
    address: "",
    name: "",
    network: "",
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );
      return poolData?.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }
  try {
    const poolData = await fetcher<{ data: PoolData[] }>("/onchain/search/pools", { query: id });

    return poolData?.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
  try {
    const [coinsData, binanceSymbols] = await Promise.all([
      fetcher<{ coins: SearchCoin[] }>("/search", { query }),
      getBinanceSymbols(),
    ]);

    if (!coinsData) return [];

    return coinsData.coins.map((coin) => {
      const candidate = `${coin.symbol.toUpperCase()}USDT`;
      return {
        ...coin,
        binanceSymbol: binanceSymbols.has(candidate) ? candidate : undefined,
      };
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getCoinById(id: string): Promise<CoinDetailsData | null> {
  try {
    const [coinData, binanceSymbols] = await Promise.all([
      fetcher<CoinDetailsData>(`/coins/${id}`, {
        dex_pair_format: "contract_address",
      }),
      getBinanceSymbols(),
    ]);

    if (!coinData) {
      console.error(`Coin data not found for ${id}`);
      return null;
    }

    const candidate = `${coinData.symbol.toUpperCase()}USDT`;
    return {
      ...coinData,
      binanceSymbol: binanceSymbols.has(candidate) ? candidate : undefined,
    };
  } catch (error) {
    console.error(`Failed to fetch coin data for ${id}:`, error);
    // Return null instead of throwing to allow 404 handling in UI
    return null;
  }
}
