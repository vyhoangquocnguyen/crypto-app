"use client";

import { useState } from "react";
import { Separator } from "./ui/separator";
import CandlestickChart from "./CandlestickChart";
import DataTable from "./DataTable";
import CoinHeader from "./CoinHeader";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebsocket";
// import { useCoinGeckoWebSocket } from "@/hooks/useCoinGeckoWebSocket";

export default function LiveDataWrapper({ coinId, coin, coinOHLCData }: LiveDataProps) {
  // Binance only supports 1m+, so we default to 1m.
  // Ideally, if we support other providers (CoinGecko) that allow 1s, we might make this dynamic.
  // const [liveInterval, setLiveInterval] = useState<"5m" | "1m">("1m");

  // const { trades, ohlcv, price } = useCoinGeckoWebSocket({ coinId, poolId, liveInterval });

  const canUseBinance = Boolean(coin.binanceSymbol);

  const binanceData = useBinanceWebSocket({
    symbol: coin.binanceSymbol ?? "",
    // Force 1m if using Binance, regardless of state (though state should be 1m)
    interval: "1m",
  });

  const trades = canUseBinance ? binanceData.trades : [];
  const ohlcv = canUseBinance ? binanceData.ohlcv : null;
  const price =
    canUseBinance ?
      binanceData.price
    : {
        usd: coin.market_data.current_price.usd,
        change24h: coin.market_data.price_change_24h_in_currency.usd,
      };
  const error = canUseBinance ? binanceData.error : null;

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : "-"),
    },
    {
      header: "Amount",
      cellClassName: "amount-cell",
      cell: (trade) => trade.amount?.toFixed(4) ?? "-",
    },
    {
      header: "Value",
      cellClassName: "value-cell",
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : "-"),
    },
    {
      header: "Buy/Sell",
      cellClassName: "type-cell",
      cell: (trade) => (
        <span className={trade.type === "b" ? "text-green-500" : "text-red-500"}>
          {trade.type === "b" ? "Buy" : "Sell"}
        </span>
      ),
    },
    {
      header: "Time",
      cellClassName: "time-cell",
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : "-"),
    },
  ];

  return (
    <section id="live-data-wrapper">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-4">
          <p className="font-bold">Live Data Connection Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {/* {children} */}
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usd ?? coin.market_data.current_price.usd}
        livePriceChangePercentage24h={price?.change24h ?? coin.market_data.price_change_percentage_24h_in_currency.usd}
        priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd}
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />
      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart coinId={coinId} data={coinOHLCData} liveOhlcv={ohlcv} mode="live" initialPeriod="daily">
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />
      {tradeColumns && (
        <div className="trades">
          <h4>Recent Trades</h4>
          <DataTable columns={tradeColumns} data={trades} rowKey={(_, index) => index} tableClassName="trades-table" />
        </div>
      )}
    </section>
  );
}
