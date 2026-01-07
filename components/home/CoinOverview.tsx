import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export async function CoinOverview() {
  const coin = await fetcher<CoinDetailsData>("coins/bitcoin", {
    dex_pair_format: "symbol",
  });
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
