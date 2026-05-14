"use client";

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
  formatSignedPercent,
} from "@/shared/lib/format";
import type { RankingItem, RankingKind } from "@/entities/kis/model/ranking";

type ValueColumn = "amount" | "volume" | "rate";

type Props = {
  title: string;
  description: string;
  kind: RankingKind;
  items: RankingItem[];
  valueColumn: ValueColumn;
  isLoading: boolean;
  errorMessage: string | null;
};

const profitColor = (value: number) =>
  value > 0 ? "text-rose-400" : value < 0 ? "text-sky-400" : "text-muted-foreground";

const formatValue = (item: RankingItem, col: ValueColumn): string => {
  if (col === "amount") {
    if (item.amount >= 100_000_000) {
      return `${formatNumber(Math.round(item.amount / 100_000_000))}억`;
    }
    return formatKrw(item.amount);
  }
  if (col === "volume") {
    return `${formatNumber(item.volume)}주`;
  }
  return formatSignedPercent(item.changeRate);
};

const valueColor = (item: RankingItem, col: ValueColumn): string =>
  col === "rate" ? profitColor(item.changeRate) : "text-foreground";

export const RankingCardView = ({
  title,
  description,
  items,
  valueColumn,
  isLoading,
  errorMessage,
}: Props) => (
  <Card className="flex h-full flex-col">
    <CardHeader className="pb-2">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="px-0 pb-2">
      {isLoading ? (
        <LoadingRows />
      ) : errorMessage ? (
        <p className="px-6 pb-2 text-xs text-destructive">{errorMessage}</p>
      ) : items.length === 0 ? (
        <p className="px-6 pb-2 text-sm text-muted-foreground">데이터가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li
              key={`${item.rank}-${item.ticker}`}
              className="flex items-center gap-3 px-6 py-2 text-sm hover:bg-accent/30"
            >
              <span className="w-6 text-right text-xs font-medium text-muted-foreground tabular-nums">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.ticker}</div>
              </div>
              <div className="text-right">
                <div className="tabular-nums">{formatKrw(item.price)}</div>
                <div
                  className={cn(
                    "text-xs tabular-nums",
                    profitColor(item.changeRate),
                  )}
                >
                  {formatSignedPercent(item.changeRate)}
                </div>
              </div>
              <div
                className={cn(
                  "w-24 text-right text-xs tabular-nums",
                  valueColor(item, valueColumn),
                )}
              >
                {formatValue(item, valueColumn)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

const LoadingRows = () => (
  <div className="space-y-2 px-6 py-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-3 w-4" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);
