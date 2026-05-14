"use client";

import Link from "next/link";

import type { StockQuoteDetail } from "@/entities/kis/model/stock-quote";
import { buttonVariants } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  formatKrw,
  formatNumber,
  formatSignedKrw,
  formatSignedPercent,
} from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

import { useStockDetailQuery } from "../api/use-stock-detail-query";

type Props = {
  ticker: string;
  /** URL `?name=` 로 넘어온 표시용(시세 로딩 전) */
  initialName?: string | null;
};

const profitColor = (value: number) =>
  value > 0 ? "text-rose-400" : value < 0 ? "text-sky-400" : "text-muted-foreground";

const Field = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className="space-y-1">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    <div className={cn("text-sm tabular-nums", className)}>{value}</div>
  </div>
);

const QuoteBody = ({ quote }: { quote: StockQuoteDetail }) => {
  const price =
    quote.currentPrice !== null ? formatKrw(quote.currentPrice) : "—";
  const diff =
    quote.changeFromPrev !== null ? formatSignedKrw(quote.changeFromPrev) : "—";
  const rate =
    quote.changeRatePercent !== null
      ? formatSignedPercent(quote.changeRatePercent)
      : "—";
  const vol = quote.volume !== null ? `${formatNumber(quote.volume)}주` : "—";
  const amt =
    quote.tradeValue !== null ? formatKrw(quote.tradeValue) : "—";

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="현재가" value={price} className="text-2xl font-semibold" />
      <Field
        label="전일대비"
        value={`${diff} (${rate})`}
        className={cn(
          quote.changeFromPrev !== null ? profitColor(quote.changeFromPrev) : undefined,
        )}
      />
      <Field label="누적 거래량" value={vol} />
      <Field label="누적 거래대금" value={amt} />
    </div>
  );
};

export const StockDetailView = ({ ticker, initialName }: Props) => {
  const valid = /^\d{6}$/.test(ticker);
  const q = useStockDetailQuery(ticker);

  const displayName = q.data?.quote.name ?? initialName ?? ticker;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← 홈
        </Link>
      </div>

      {!valid ? (
        <p className="text-sm text-destructive">6자리 숫자 종목코드만 조회할 수 있습니다.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">{displayName}</CardTitle>
            <CardDescription className="font-mono text-sm">{ticker}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {q.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : q.error instanceof Error ? (
              <p className="text-sm text-destructive">{q.error.message}</p>
            ) : q.data ? (
              <>
                <QuoteBody quote={q.data.quote} />
                <details className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                  <summary className="cursor-pointer font-medium text-muted-foreground">
                    원본 응답 (디버그)
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto text-xs leading-relaxed">
                    {JSON.stringify(q.data.raw, null, 2)}
                  </pre>
                </details>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
