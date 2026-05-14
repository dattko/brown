"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/shared/api/fetch-json";

export type StockSearchItem = { ticker: string; name: string };

type SearchResponse = { items: StockSearchItem[] };

export const useStockSearchQuery = (
  debouncedQuery: string,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: ["kis", "stock", "search", debouncedQuery],
    queryFn: () =>
      fetchJson<SearchResponse>(
        `/api/stock/search?q=${encodeURIComponent(debouncedQuery)}`,
      ),
    enabled:
      enabled &&
      debouncedQuery.length >= 1 &&
      debouncedQuery.length <= 40,
    staleTime: 20_000,
  });
