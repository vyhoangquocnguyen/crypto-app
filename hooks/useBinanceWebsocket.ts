"use client";

import { useEffect, useRef, useState } from "react";

export function useBinanceWebSocket({ symbol, interval }: UseBinanceWebSocketProps): UseBinanceWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !symbol) return;

    const WS_BASE = process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL;

    if (!WS_BASE) {
      console.error("NEXT_PUBLIC_BINANCE_WS_BASE_URL environment variable is not set");
      return;
    }

    const streams = [
      `${symbol.toLowerCase()}@ticker`,
      `${symbol.toLowerCase()}@trade`,
      `${symbol.toLowerCase()}@kline_${interval}`,
    ].join("/");

    try {
      // Use the /stream endpoint for combined streams
      const baseUrl = WS_BASE.endsWith("/ws") ? WS_BASE.replace("/ws", "/stream") : WS_BASE;
      const url = `${baseUrl}?streams=${streams}`;

      console.log(`Connecting to Binance WebSocket: ${url}`);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected for ${symbol}`);
        setIsConnected(true);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const data = message.data;
        //   PRICE
        if (data?.e === "24hrTicker") {
          setPrice({
            coin: symbol,
            usd: Number(data.c),
            price: Number(data.c),
            change24h: Number(data.p),
            volume24h: Number(data.v),
            timestamp: data.E,
          });
        }

        // TRADES
        if (data?.e === "trade") {
          const newtrade: Trade = {
            price: Number(data.p),
            amount: Number(data.q),
            value: Number(data.p) * Number(data.q),
            timestamp: data.T,
            type: data.m ? "s" : "b",
          };
          setTrades((prevTrade) => [newtrade, ...prevTrade].slice(0, 7));
        }

        // OHLCV
        if (data?.e === "kline") {
          const k = data.k;
          setOhlcv([k.t, Number(k.o), Number(k.h), Number(k.l), Number(k.c)]);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
    }
  }, [symbol, interval]);
  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
}
