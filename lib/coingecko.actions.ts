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

export async function fetcher<T>(endpoint: string, params?: QueryParams, revalidate = 60): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true }
  );

  const response = await fetch(url, {
    headers: {
      "x-cg-demo-api-key": API_KEY,
      "Content-Type": "application/json",
    } as Record<string, string>,
    next: { revalidate },
  });
  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

    throw new Error(`API Error ${response.status}: ${errorBody.error || response.statusText}`);
  }

  const data: T = await response.json().catch(() => ({}));
  return data;
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null
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
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`
      );
      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }
  try {
    const poolData = await fetcher<{ data: PoolData[] }>("/onchain/search/pools", { query: id });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
  try {
    const coins = await fetcher<{ coins: SearchCoin[] }>(`/search?query=${query}`);
    const binanceSymbols = await getBinanceSymbols();

    return coins.coins.map((coin) => {
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

export async function getCoinById(id: string): Promise<CoinDetailsData> {
  const [coinData, binanceSymbols] = await Promise.all([
    fetcher<CoinDetailsData>(`/coins/${id}`, {
      dex_pair_format: "contract_address",
    }),
    getBinanceSymbols(),
  ]);

  const candidate = `${coinData.symbol.toUpperCase()}USDT`;
  return {
    ...coinData,
    binanceSymbol: binanceSymbols.has(candidate) ? candidate : undefined,
  };
}
