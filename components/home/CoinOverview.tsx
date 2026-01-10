/* eslint-disable react-hooks/error-boundaries */
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { CoinOverviewFallback } from "./fallback";
import CandlestickChart from "../CandlestickChart";

export async function CoinOverview() {
  try {
    const [coin, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>("coins/bitcoin", {
        dex_pair_format: "symbol",
      }),
      fetcher<OHLCData[]>("coins/bitcoin/ohlc", {
        vs_currency: "usd",
        days: 1,
        precision: "full",
      }),
    ]);

    return (
      <div id="coin-overview">
        <CandlestickChart data={coinOHLCData} coinId={coin.id}>
          <div className="header p-2">
            <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
            <div className="info">
              <p>
                {coin.name}
                <span>/ {coin.symbol.toUpperCase()}</span>
              </p>
              <h1>{formatCurrency(coin.market_data.current_price.usd)} USD</h1>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.log("Error fetching coin details:", error);
    return <CoinOverviewFallback />;
  }
}
