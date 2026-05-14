"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";

import type { Ranking } from "@/entities/kis/model/ranking";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { useKisFluctuationRankQuery, useKisVolumeRankQuery } from "../api/use-kis-ranking-queries";
import { useRankingWsBridge } from "../model/use-ranking-ws-bridge";
import { useRankingUiStore, type RankingUiTab } from "../model/ranking-ui-store";
import { RankingCardView } from "./ranking-card-view";

const errorOf = (q: UseQueryResult<Ranking>): string | null =>
  q.error instanceof Error ? q.error.message : null;

const AmountPanel = () => {
  const q = useKisVolumeRankQuery("amount");
  return (
    <RankingCardView
      title="거래대금 TOP"
      description="당일 누적 거래대금 상위"
      kind="amount"
      items={q.data?.items ?? []}
      valueColumn="amount"
      isLoading={q.isLoading}
      errorMessage={errorOf(q)}
    />
  );
};

const VolumePanel = () => {
  const q = useKisVolumeRankQuery("volume");
  return (
    <RankingCardView
      title="거래량 TOP"
      description="당일 누적 거래량 상위"
      kind="volume"
      items={q.data?.items ?? []}
      valueColumn="volume"
      isLoading={q.isLoading}
      errorMessage={errorOf(q)}
    />
  );
};

const RisePanel = () => {
  const q = useKisFluctuationRankQuery("up");
  return (
    <RankingCardView
      title="급상승 TOP"
      description="전일 종가 대비 상승(%)만 · 큰 순"
      kind="rise"
      items={q.data?.items ?? []}
      valueColumn="rate"
      isLoading={q.isLoading}
      errorMessage={errorOf(q)}
    />
  );
};

const FallPanel = () => {
  const q = useKisFluctuationRankQuery("down");
  return (
    <RankingCardView
      title="급하락 TOP"
      description="전일 종가 대비 하락(%)만 · 마이너스 큰 순"
      kind="fall"
      items={q.data?.items ?? []}
      valueColumn="rate"
      isLoading={q.isLoading}
      errorMessage={errorOf(q)}
    />
  );
};

export const RankingBoard = () => {
  const tab = useRankingUiStore((s) => s.activeTab);
  const setTab = useRankingUiStore((s) => s.setActiveTab);
  const wsConnected = useRankingUiStore((s) => s.wsConnected);
  useRankingWsBridge();

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">실시간 순위</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          KIS 실전 OpenAPI 기준.
          {wsConnected
            ? " WebSocket 브리지가 선택 탭 순위를 서버에서 주기적으로 받아 푸시합니다."
            : " WebSocket 서버(`npm run ws:dev`)가 없으면 선택한 탭만 5초마다 REST로 갱신합니다."}
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as RankingUiTab)}>
        <TabsList>
          <TabsTrigger value="amount">거래대금</TabsTrigger>
          <TabsTrigger value="volume">거래량</TabsTrigger>
          <TabsTrigger value="rise">
            <TrendingUp className="text-rose-400" />
            급상승
          </TabsTrigger>
          <TabsTrigger value="fall">
            <TrendingDown className="text-sky-400" />
            급하락
          </TabsTrigger>
        </TabsList>

        <TabsContent value="amount">
          <AmountPanel />
        </TabsContent>
        <TabsContent value="volume">
          <VolumePanel />
        </TabsContent>
        <TabsContent value="rise">
          <RisePanel />
        </TabsContent>
        <TabsContent value="fall">
          <FallPanel />
        </TabsContent>
      </Tabs>
    </section>
  );
};
