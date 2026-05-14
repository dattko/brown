"use client";

import { useQuery } from "@tanstack/react-query";

import type { KisBalance } from "@/entities/kis/model/balance";

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
