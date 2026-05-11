"use client";

import { useQuery } from "@tanstack/react-query";

import type { KisBalance } from "@/entities/kis/model/balance";
import type {
  FluctuationDirection,
  Ranking,
  VolumeRankSort,
} from "@/entities/kis/model/ranking";
import { fetchJson } from "./fetch-json";

export const useKisTokenQuery = () =>
  useQuery({
    queryKey: ["kis", "token"],
    queryFn: () => fetchJson("/api/token"),
  });

export const useKisStockQuery = () =>
  useQuery({
    queryKey: ["kis", "stock"],
    queryFn: () => fetchJson("/api/stock"),
  });

export const useKisBalanceQuery = () =>
  useQuery({
    queryKey: ["kis", "balance"],
    queryFn: () => fetchJson<KisBalance>("/api/balance"),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

type RankingOptions = {
  /** 자동 새로고침 주기(ms). 기본 5초. null/false 면 자동 새로고침 안 함 */
  refetchIntervalMs?: number | false;
  enabled?: boolean;
};

const DEFAULT_RANKING_POLL_MS = 5_000;

export const useKisVolumeRankQuery = (
  sort: VolumeRankSort = "volume",
  { refetchIntervalMs = DEFAULT_RANKING_POLL_MS, enabled = true }: RankingOptions = {},
) =>
  useQuery({
    queryKey: ["kis", "ranking", "volume", sort],
    queryFn: () => fetchJson<Ranking>(`/api/ranking/volume?sort=${sort}`),
    enabled,
    refetchInterval: refetchIntervalMs === false ? false : refetchIntervalMs,
    refetchOnWindowFocus: false,
  });

export const useKisFluctuationRankQuery = (
  direction: FluctuationDirection = "up",
  { refetchIntervalMs = DEFAULT_RANKING_POLL_MS, enabled = true }: RankingOptions = {},
) =>
  useQuery({
    queryKey: ["kis", "ranking", "fluctuation", "v2", direction],
    queryFn: () =>
      fetchJson<Ranking>(`/api/ranking/fluctuation?direction=${direction}`),
    enabled,
    refetchInterval: refetchIntervalMs === false ? false : refetchIntervalMs,
    refetchOnWindowFocus: false,
  });
