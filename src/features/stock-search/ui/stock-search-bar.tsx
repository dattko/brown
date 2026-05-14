"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

import { useStockSearchQuery } from "../api/use-stock-search-query";

type Props = {
  className?: string;
  /** 입력창 짧은 폭(헤더 한 줄) */
  compact?: boolean;
};

export const StockSearchBar = ({ className, compact }: Props) => {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 320);
    return () => clearTimeout(t);
  }, [q]);

  const canSearch =
    open && debounced.length >= 1 && debounced.length <= 40;
  const { data, isFetching, isError, error } = useStockSearchQuery(debounced, {
    enabled: canSearch,
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const items = data?.items ?? [];
  const errMsg = isError && error instanceof Error ? error.message : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 shadow-sm",
          compact ? "max-w-full sm:max-w-sm" : "max-w-md",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="종목명 · 종목코드 검색"
          className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="stock-search-results"
        />
        {isFetching ? (
          <span className="shrink-0 text-xs text-muted-foreground">검색…</span>
        ) : null}
      </div>

      {open && debounced.length >= 1 ? (
        <ul
          id="stock-search-results"
          role="listbox"
          className="absolute right-0 z-50 mt-1 max-h-72 w-full min-w-[min(100%,18rem)] overflow-auto rounded-md border border-border bg-popover py-1 text-sm text-popover-foreground shadow-md"
        >
          {errMsg ? (
            <li className="px-3 py-2 text-xs text-destructive">{errMsg}</li>
          ) : items.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              목록에 없는 종목입니다. (순위·보유 종목 기준)
            </li>
          ) : (
            items.map((it) => {
              const href = `/stock/${it.ticker}?${new URLSearchParams({ name: it.name }).toString()}`;
              return (
                <li key={it.ticker} role="option" aria-selected={false}>
                  <Link
                    href={href}
                    className="flex flex-col gap-0.5 px-3 py-2 hover:bg-accent/60"
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                      setDebounced("");
                    }}
                  >
                    <span className="font-medium">{it.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{it.ticker}</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
};
