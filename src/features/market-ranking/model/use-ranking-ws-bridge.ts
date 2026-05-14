"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import type { FluctuationDirection, VolumeRankSort } from "@/entities/kis/model/ranking";

import type { ServerToClientMessage } from "../config/ranking-ws-protocol";
import { isRankingWsChannel, uiTabToRankingChannel } from "../config/ranking-ws-protocol";
import { useRankingUiStore, type RankingUiStoreState } from "./ranking-ui-store";

const wsUrl = (): string =>
  process.env.NEXT_PUBLIC_BROWN_WS_URL?.trim() || "ws://127.0.0.1:8787";

const setVolumeCache = (queryClient: ReturnType<typeof useQueryClient>, sort: VolumeRankSort, data: unknown) => {
  queryClient.setQueryData(["kis", "ranking", "volume", sort], data);
};

const setFluctuationCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  direction: FluctuationDirection,
  data: unknown,
) => {
  queryClient.setQueryData(["kis", "ranking", "fluctuation", "v2", direction], data);
};

const applyRankingMessage = (
  queryClient: ReturnType<typeof useQueryClient>,
  msg: Extract<ServerToClientMessage, { type: "ranking" }>,
) => {
  const { channel, data } = msg;
  switch (channel) {
    case "ranking:volume:amount":
      setVolumeCache(queryClient, "amount", data);
      break;
    case "ranking:volume:volume":
      setVolumeCache(queryClient, "volume", data);
      break;
    case "ranking:fluctuation:up":
      setFluctuationCache(queryClient, "up", data);
      break;
    case "ranking:fluctuation:down":
      setFluctuationCache(queryClient, "down", data);
      break;
    default:
      break;
  }
};

type Options = {
  /** false면 연결하지 않음(폴링만) */
  enabled?: boolean;
};

/**
 * 순위 탭이 바뀔 때마다 WS 서버에 subscribe/unsubscribe.
 * 수신 시 React Query 캐시를 갱신해 화면이 즉시 따라가게 함.
 * 연결 상태는 `useRankingUiStore`의 `wsConnected`에 반영.
 */
export const useRankingWsBridge = ({ enabled = true }: Options = {}) => {
  const queryClient = useQueryClient();
  const activeUiTab = useRankingUiStore((s: RankingUiStoreState) => s.activeTab);
  const setWsConnected = useRankingUiStore((s: RankingUiStoreState) => s.setWsConnected);
  const wsConnected = useRankingUiStore((s: RankingUiStoreState) => s.wsConnected);

  /** 소켓이 끊긴 뒤 같은 effect에서 재연결하기 위한 토큰 */
  const [wsGeneration, setWsGeneration] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const tabRef = useRef(activeUiTab);
  const subscribedRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    tabRef.current = activeUiTab;
  }, [activeUiTab]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    const url = wsUrl();

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        if (!cancelled) setWsGeneration((g) => g + 1);
      }, 4_000);
      return () => {
        cancelled = true;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelled) return;
      setWsConnected(true);
      const ch = uiTabToRankingChannel(tabRef.current);
      if (ch) {
        ws.send(JSON.stringify({ type: "subscribe", channel: ch }));
        subscribedRef.current = ch;
      }
    };

    ws.onmessage = (ev) => {
      if (cancelled) return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(ev.data)) as ServerToClientMessage;
      } catch {
        return;
      }
      if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return;
      if (parsed.type === "ranking") {
        applyRankingMessage(
          queryClient,
          parsed as Extract<ServerToClientMessage, { type: "ranking" }>,
        );
      }
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    ws.onclose = () => {
      wsRef.current = null;
      subscribedRef.current = null;
      setWsConnected(false);
      if (cancelled) {
        return;
      }
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        setWsGeneration((g) => g + 1);
      }, 4_000);
    };

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current = null;
      subscribedRef.current = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [enabled, queryClient, setWsConnected, wsGeneration]);

  /** 탭 전환 시 구독만 갈아끼움 */
  useEffect(() => {
    const ws = wsRef.current;
    if (!enabled || !ws || ws.readyState !== WebSocket.OPEN) return;

    const next = uiTabToRankingChannel(activeUiTab);
    if (!next) return;

    const prev = subscribedRef.current;
    if (prev === next) return;

    if (prev && isRankingWsChannel(prev)) {
      ws.send(JSON.stringify({ type: "unsubscribe", channel: prev }));
    }
    ws.send(JSON.stringify({ type: "subscribe", channel: next }));
    subscribedRef.current = next;
  }, [activeUiTab, enabled, wsConnected]);
};
