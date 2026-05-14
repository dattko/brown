"use client";

import { RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import {
  formatKrw,
  formatSignedKrw,
  formatSignedPercent,
} from "@/shared/lib/format";
import type { PortfolioSummaryVm } from "../model/use-portfolio-summary";

type Props = PortfolioSummaryVm;

const profitColor = (value: number) =>
  value > 0 ? "text-rose-400" : value < 0 ? "text-sky-400" : "text-muted-foreground";

const profitRate = (profitLoss: number, base: number): number => {
  if (!base) return 0;
  return (profitLoss / base) * 100;
};

export const PortfolioSummaryView = ({
  summary,
  isMock,
  isLoading,
  isFetching,
  errorMessage,
  refresh,
}: Props) => (
  <section className="space-y-4">
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">내 잔고</h2>
          {isMock ? <Badge variant="warning">모의투자</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          KIS 주식잔고조회 결과 · 자동 새로고침은 없으며 버튼으로 갱신합니다.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={refresh}
        disabled={isFetching}
        aria-label="새로고침"
      >
        <RefreshCw className={cn(isFetching && "animate-spin")} />
        새로고침
      </Button>
    </div>

    {errorMessage ? (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardContent className="py-4 text-sm text-destructive-foreground/90">
          {errorMessage}
        </CardContent>
      </Card>
    ) : null}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="총 평가자산"
        description="예수금 + 주식 평가"
        icon={<Wallet className="text-muted-foreground" />}
        value={summary ? formatKrw(summary.totalEvaluation) : null}
        isLoading={isLoading}
      />
      <SummaryCard
        title="평가손익"
        description="누적 손익(원)"
        icon={
          summary && summary.profitLoss < 0 ? (
            <TrendingDown className={profitColor(summary.profitLoss)} />
          ) : (
            <TrendingUp className={profitColor(summary?.profitLoss ?? 0)} />
          )
        }
        value={summary ? formatSignedKrw(summary.profitLoss) : null}
        valueClassName={summary ? profitColor(summary.profitLoss) : undefined}
        sub={
          summary
            ? formatSignedPercent(profitRate(summary.profitLoss, summary.purchaseTotal))
            : null
        }
        isLoading={isLoading}
      />
      <SummaryCard
        title="주식 평가금액"
        description="현재가 기준"
        value={summary ? formatKrw(summary.stockEvaluation || summary.evaluationTotal) : null}
        isLoading={isLoading}
      />
      <SummaryCard
        title="예수금"
        description="주문 가능 현금(D+0~)"
        value={summary ? formatKrw(summary.cashTotal) : null}
        isLoading={isLoading}
      />
    </div>
  </section>
);

type SummaryCardProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  value: string | null;
  valueClassName?: string;
  sub?: string | null;
  isLoading?: boolean;
};

const SummaryCard = ({
  title,
  description,
  icon,
  value,
  valueClassName,
  sub,
  isLoading,
}: SummaryCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon ?? null}
      </div>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-7 w-32" />
      ) : (
        <div className={cn("text-2xl font-semibold tracking-tight", valueClassName)}>
          {value ?? "—"}
        </div>
      )}
      {sub ? (
        <div className={cn("mt-1 text-xs", valueClassName)}>{sub}</div>
      ) : null}
    </CardContent>
  </Card>
);
