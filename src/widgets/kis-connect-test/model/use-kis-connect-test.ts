"use client";

import { useKisStockQuery, useKisTokenQuery } from "@/shared/api/use-kis-queries";

export type KisConnectTestVm = {
  tokenData: unknown;
  stockData: unknown;
  errorMessage: string | null;
  isAnyFetching: boolean;
  isTokenFetching: boolean;
  isStockFetching: boolean;
  loadToken: () => void;
  loadStock: () => void;
  loadBoth: () => void;
};

/** KIS 연동 테스트 위젯의 비즈니스 로직(서버 데이터·트리거)만 모은 훅 */
export const useKisConnectTest = (): KisConnectTestVm => {
  const tokenQuery = useKisTokenQuery();
  const stockQuery = useKisStockQuery();

  const errorMessage =
    tokenQuery.error instanceof Error
      ? `토큰: ${tokenQuery.error.message}`
      : stockQuery.error instanceof Error
        ? `주가: ${stockQuery.error.message}`
        : null;

  const isAnyFetching = tokenQuery.isFetching || stockQuery.isFetching;

  const loadToken = () => {
    void tokenQuery.refetch();
  };

  const loadStock = () => {
    void stockQuery.refetch();
  };

  const loadBoth = () => {
    void Promise.all([tokenQuery.refetch(), stockQuery.refetch()]);
  };

  return {
    tokenData: tokenQuery.data ?? null,
    stockData: stockQuery.data ?? null,
    errorMessage,
    isAnyFetching,
    isTokenFetching: tokenQuery.isFetching,
    isStockFetching: stockQuery.isFetching,
    loadToken,
    loadStock,
    loadBoth,
  };
};
