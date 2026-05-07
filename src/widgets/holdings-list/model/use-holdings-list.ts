"use client";

import { useKisBalanceQuery } from "@/shared/api/use-kis-queries";
import type { KisHolding } from "@/entities/kis/model/balance";

export type HoldingsListVm = {
  holdings: KisHolding[];
  isLoading: boolean;
  errorMessage: string | null;
};

export const useHoldingsList = (): HoldingsListVm => {
  const q = useKisBalanceQuery();
  return {
    holdings: q.data?.holdings ?? [],
    isLoading: q.isLoading,
    errorMessage: q.error instanceof Error ? q.error.message : null,
  };
};
