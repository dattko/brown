"use client";

import { useRouter } from "next/navigation";

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
  formatNumber,
  formatSignedKrw,
  formatSignedPercent,
} from "@/shared/lib/format";
import type { HoldingsListVm } from "../model/use-holdings-list";

type Props = HoldingsListVm;

const profitColor = (value: number) =>
  value > 0 ? "text-rose-400" : value < 0 ? "text-sky-400" : "text-muted-foreground";

export const HoldingsListView = ({ holdings, isLoading, errorMessage }: Props) => {
  const router = useRouter();

  const goDetail = (ticker: string, name: string) => {
    const q = new URLSearchParams({ name });
    void router.push(`/stock/${ticker}?${q.toString()}`);
  };

  return (
    <Card>
    <CardHeader>
      <CardTitle>보유 종목</CardTitle>
      <CardDescription>
        현재 잔고에 들어 있는 종목과 수익 현황입니다. 행을 클릭하면 상세 화면으로 이동합니다.
      </CardDescription>
    </CardHeader>
    <CardContent className="px-0 pb-0">
      {isLoading ? (
        <LoadingRows />
      ) : errorMessage ? (
        <p className="px-6 pb-6 text-sm text-destructive">{errorMessage}</p>
      ) : holdings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/30 text-xs text-muted-foreground">
                <Th className="text-left">종목</Th>
                <Th>수량</Th>
                <Th>평균단가</Th>
                <Th>현재가</Th>
                <Th>평가금액</Th>
                <Th>평가손익</Th>
                <Th>수익률</Th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr
                  key={h.ticker}
                  role="link"
                  tabIndex={0}
                  aria-label={`${h.name} 상세 보기`}
                  onClick={() => goDetail(h.ticker, h.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goDetail(h.ticker, h.name);
                    }
                  }}
                  className="cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-accent/30"
                >
                  <Td className="text-left">
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">{h.ticker}</div>
                  </Td>
                  <Td>{formatNumber(h.quantity)}</Td>
                  <Td>{formatKrw(h.averagePrice)}</Td>
                  <Td>{formatKrw(h.currentPrice)}</Td>
                  <Td>{formatKrw(h.evaluationAmount)}</Td>
                  <Td className={profitColor(h.profitLoss)}>
                    {formatSignedKrw(h.profitLoss)}
                  </Td>
                  <Td className={profitColor(h.profitLoss)}>
                    {formatSignedPercent(h.profitLossRate)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
  );
};

const Th = ({ className, children }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    scope="col"
    className={cn(
      "px-4 py-2 text-right font-medium uppercase tracking-wide",
      className,
    )}
  >
    {children}
  </th>
);

const Td = ({ className, children }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-3 text-right tabular-nums", className)}>{children}</td>
);

const LoadingRows = () => (
  <div className="space-y-3 px-6 pb-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="ml-auto h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="px-6 pb-6 pt-2 text-center text-sm text-muted-foreground">
    아직 보유한 종목이 없어요. 모의투자 계좌에서 매수가 체결되면 여기에 표시됩니다.
  </div>
);
