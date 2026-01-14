"use client";

import { useEffect, useRef, useState } from "react";

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WS_BASE_URL}?x_cg_demo_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

export function useCoinGeckoWebSocket({
  coinId,
  poolId,
  liveInterval,
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribed = useRef<Set<string>>(new Set());

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);

  const [isWsReady, setIsWsReady] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;

    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    const handleMessage = (event: MessageEvent) => {
      const msg: WebSocketMessage = JSON.parse(event.data);
      if (msg.type === "ping") {
        send({ type: "pong" });
        return;
      }

      if (msg.type === "confirm_subscription") {
        try {
          const { channel } = JSON.parse(msg?.identifier ?? "{}");
          if (channel) subscribed.current.add(channel);
        } catch {
          console.warn("Failed to parse subscription identifier:", msg?.identifier);
        }
      }

      if (msg.c === "C1") {
        setPrice({
          usd: msg.p ?? 0,
          coin: msg.i,
          price: msg.p,
          change24h: msg.pp,
          marketCap: msg.m,
          volume24h: msg.v,
          timestamp: msg.t,
        });
      }
      if (msg.c === "G2") {
        const newTrade: Trade = {
          price: msg.pu,
          value: msg.vo,
          timestamp: msg.t ?? 0,
          type: msg.ty,
          amount: msg.m,
        };
        setTrades((prevTrades) => [newTrade, ...prevTrades].slice(0, 7));
      }

      if (msg.c === "G3") {
        const timestamp = msg.t ?? 0;

        const candle: OHLCData = [timestamp, Number(msg.o), Number(msg.h), Number(msg.l), Number(msg.c)];
        setOhlcv(candle);
      }
    };

    ws.onopen = () => {
      setIsWsReady(true);
    };
    ws.onmessage = handleMessage;

    ws.onclose = (error) => {
      console.log("WebSocket closed:", error)
      setIsWsReady(false);
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!isWsReady) return;
    const ws = wsRef.current;
    if (!ws) return;

    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    const unsubcribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({
          command: "unsubscribe",
          identifier: JSON.stringify({ channel }),
        });
      });
      subscribed.current.clear();
    };

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if (subscribed.current.has(channel)) return;
      send({
        command: "subscribe",
        identifier: JSON.stringify({ channel }),
      });

      if (data) {
        send({
          command: "message",
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };
    queueMicrotask(() => {
      setPrice(null);
      setTrades([]);
      setOhlcv(null);

      unsubcribeAll();
      subscribe("CGSimplePrice", {
        coin_id: coinId,
        action: "set_tokens",
      });

      if (poolId) {
        const poolAddress = poolId?.replace("_", ":") ?? "";
        subscribe("OnchainTrade", {
          "network_id:pool_addresses": [poolAddress],
          action: "set_pools",
        });
        subscribe("OnchainOHLCV", {
          "network_id:pool_addresses": [poolAddress],
          interval: liveInterval,
          action: "set_pools",
        });
      }
    });
  }, [coinId, poolId, liveInterval, isWsReady]);

  return {
    price,
    trades,
    ohlcv,
    isConnected: isWsReady,
  };
}
