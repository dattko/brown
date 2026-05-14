import type { Ranking } from "@/entities/kis/model/ranking";

/** 브라우저 탭 value → 서버가 이해하는 채널 id */
export const RANKING_CHANNELS = [
  "ranking:volume:amount",
  "ranking:volume:volume",
  "ranking:fluctuation:up",
  "ranking:fluctuation:down",
] as const;

export type RankingWsChannel = (typeof RANKING_CHANNELS)[number];

export const isRankingWsChannel = (s: string): s is RankingWsChannel =>
  (RANKING_CHANNELS as readonly string[]).includes(s);

export type ClientToServerMessage =
  | { type: "subscribe"; channel: RankingWsChannel }
  | { type: "unsubscribe"; channel: RankingWsChannel }
  | { type: "ping" };

export type ServerToClientMessage =
  | { type: "welcome"; message: string }
  | { type: "ranking"; channel: RankingWsChannel; data: Ranking; ts: number }
  | { type: "error"; channel: RankingWsChannel | null; message: string; ts: number }
  | { type: "pong"; ts: number };

export const uiTabToRankingChannel = (tab: string): RankingWsChannel | null => {
  switch (tab) {
    case "amount":
      return "ranking:volume:amount";
    case "volume":
      return "ranking:volume:volume";
    case "rise":
      return "ranking:fluctuation:up";
    case "fall":
      return "ranking:fluctuation:down";
    default:
      return null;
  }
};
