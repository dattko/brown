"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  FluctuationDirection,
  Ranking,
  VolumeRankSort,
} from "@/entities/kis/model/ranking";
import { fetchJson } from "@/shared/api/fetch-json";

import { useRankingUiStore, type RankingUiStoreState } from "../model/ranking-ui-store";

type RankingOptions = {
  /** 자동 새로고침 주기(ms). 기본 5초. null/false 면 자동 새로고침 안 함 */
  refetchIntervalMs?: number | false;
  enabled?: boolean;
};

const DEFAULT_RANKING_POLL_MS = 5_000;

export const useKisVolumeRankQuery = (
  sort: VolumeRankSort = "volume",
  { refetchIntervalMs = DEFAULT_RANKING_POLL_MS, enabled = true }: RankingOptions = {},
) => {
  const wsStopsPoll = useRankingUiStore((s: RankingUiStoreState) => s.wsConnected);
  const refetchInterval =
    wsStopsPoll ? false : refetchIntervalMs === false ? false : refetchIntervalMs;
  return useQuery({
    queryKey: ["kis", "ranking", "volume", sort],
    queryFn: () => fetchJson<Ranking>(`/api/ranking/volume?sort=${sort}`),
    enabled,
    refetchInterval,
    refetchOnWindowFocus: false,
  });
};

export const useKisFluctuationRankQuery = (
  direction: FluctuationDirection = "up",
  { refetchIntervalMs = DEFAULT_RANKING_POLL_MS, enabled = true }: RankingOptions = {},
) => {
  const wsStopsPoll = useRankingUiStore((s: RankingUiStoreState) => s.wsConnected);
  const refetchInterval =
    wsStopsPoll ? false : refetchIntervalMs === false ? false : refetchIntervalMs;
  return useQuery({
    queryKey: ["kis", "ranking", "fluctuation", "v2", direction],
    queryFn: () =>
      fetchJson<Ranking>(`/api/ranking/fluctuation?direction=${direction}`),
    enabled,
    refetchInterval,
    refetchOnWindowFocus: false,
  });
};
