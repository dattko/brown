"use client";

import { useQuery } from "@tanstack/react-query";

import type { StockQuoteDetail } from "@/entities/kis/model/stock-quote";
import { fetchJson } from "@/shared/api/fetch-json";

type StockDetailApiOk = {
  quote: StockQuoteDetail;
  raw: unknown;
};

export const useStockDetailQuery = (ticker: string) =>
  useQuery({
    queryKey: ["kis", "stock", "detail", ticker],
    queryFn: () => fetchJson<StockDetailApiOk>(`/api/stock/${encodeURIComponent(ticker)}`),
    enabled: /^\d{6}$/.test(ticker),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
