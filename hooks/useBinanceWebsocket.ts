"use client";

import { useEffect, useRef, useState } from "react";

export function useBinanceWebSocket({ symbol, interval }: UseBinanceWebSocketProps): UseBinanceWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize error based on env var presence to avoid useEffect setState warning
  const WS_BASE = process.env.NEXT_PUBLIC_BINANCE_WS_BASE_URL;
  const [error, setError] = useState<string | null>(
    !WS_BASE ? "NEXT_PUBLIC_BINANCE_WS_BASE_URL environment variable is not set" : null,
  );

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !symbol || !WS_BASE) return;

    const binanceSymbol = symbol.toLowerCase().trim();
    if (!binanceSymbol) return;

    const streams = [`${binanceSymbol}@ticker`, `${binanceSymbol}@trade`, `${binanceSymbol}@kline_${interval}`].join(
      "/",
    );

    try {
      // Use the /stream endpoint for combined streams
      const baseUrl = WS_BASE.endsWith("/ws") ? WS_BASE.replace("/ws", "/stream") : WS_BASE;
      const url = `${baseUrl}?streams=${streams}`;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onerror = (errorEvent) => {
        console.error(`WebSocket error for ${binanceSymbol}:`, errorEvent);
        setIsConnected(false);
        setError(`Connection Error: Check console. URL: ${url}`);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const data = message.data;
          //   PRICE
          if (data?.e === "24hrTicker") {
            setPrice({
              coin: symbol, // Keep original symbol casing for UI if needed, or use binanceSymbol
              usd: Number(data.c),
              price: Number(data.c),
              change24h: Number(data.P),
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
        } catch (error) {
          console.error(`Failed to parse WebSocket message for ${binanceSymbol}:`, error, event.data);
        }
      };

      ws.onclose = (event) => {
        // If wsRef.current is null, it means we intentionally closed it in cleanup
        const isIntentional = wsRef.current !== ws;

        if (isIntentional) {
          console.log(`WebSocket closed intentionally for ${binanceSymbol}`);
        } else {
          if (event.wasClean) {
            console.log(
              `WebSocket closed CLEANLY by server/network for ${binanceSymbol}, code=${event.code} reason=${event.reason}`,
            );
            // Code 1005 (No Status) from server often means "I'm done" or "Go away" without error
            if (event.code === 1005) {
              setError(`Connection closed by server (1005).`);
            }
          } else {
            const msg = `WebSocket connection died for ${binanceSymbol}. Code: ${event.code}`;
            console.warn(msg, `reason=${event.reason}`);
            if (event.code !== 1000) {
              // 1000 is normal closure
              setError(msg);
            }
          }
          setIsConnected(false);
        }
      };

      return () => {
        // Mark as intentional close by clearing ref before closing
        if (wsRef.current === ws) {
          console.log(`Unmounting/Updating: Closing WebSocket for ${binanceSymbol}`);
          wsRef.current = null;
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        }
      };
    } catch (error: unknown) {
      console.error("Failed to create WebSocket:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to create WebSocket: ${errorMessage}`);
    }
  }, [symbol, interval, WS_BASE]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
    error,
  };
}
