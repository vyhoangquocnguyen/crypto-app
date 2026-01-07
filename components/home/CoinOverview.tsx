import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { CoinOverviewFallback } from "./fallback";

export async function CoinOverview() {
  let coin;
  try {
    coin = await fetcher<CoinDetailsData>("coins/bitcoin", {
      dex_pair_format: "symbol",
    });
  } catch (error) {
    console.log("Error fetching coin details:", error);
    return <CoinOverviewFallback />;
  }
  return (
    <div id="coin-overview">
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
    </div>
  );
}
