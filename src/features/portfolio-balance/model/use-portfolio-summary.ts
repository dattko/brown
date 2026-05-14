"use client";

import { useKisBalanceQuery } from "@/shared/api/use-kis-queries";
import type { KisAccountSummary } from "@/entities/kis/model/balance";

export type PortfolioSummaryVm = {
  summary: KisAccountSummary | null;
  isMock: boolean;
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  refresh: () => void;
};

export const usePortfolioSummary = (): PortfolioSummaryVm => {
  const q = useKisBalanceQuery();

  return {
    summary: q.data?.summary ?? null,
    isMock: q.data?.isMock ?? false,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    errorMessage: q.error instanceof Error ? q.error.message : null,
    refresh: () => {
      void q.refetch();
    },
  };
};
