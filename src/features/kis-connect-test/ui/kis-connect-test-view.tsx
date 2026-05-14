"use client";

import type { KisConnectTestVm } from "../model/use-kis-connect-test";

type Props = KisConnectTestVm;

/** 순수 표현용. 데이터·트리거는 props로만 받음. */
export const KisConnectTestView = ({
  tokenData,
  stockData,
  errorMessage,
  isAnyFetching,
  isTokenFetching,
  isStockFetching,
  loadToken,
  loadStock,
  loadBoth,
}: Props) => (
  <main className="mx-auto max-w-3xl px-4 py-10">
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">KIS 연동</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Route Handler{" "}
        <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">GET /api/token</code> ·{" "}
        <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">GET /api/stock</code>
        <span className="mx-1 text-zinc-600">→</span>
        <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">entities/kis</code>
      </p>
    </header>

    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isAnyFetching}
        onClick={loadToken}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {isTokenFetching ? "불러오는 중…" : "토큰 조회"}
      </button>
      <button
        type="button"
        disabled={isAnyFetching}
        onClick={loadStock}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {isStockFetching ? "불러오는 중…" : "주가 조회 (삼성전자)"}
      </button>
      <button
        type="button"
        disabled={isAnyFetching}
        onClick={loadBoth}
        className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900 disabled:opacity-50"
      >
        {isAnyFetching ? "불러오는 중…" : "둘 다"}
      </button>
    </div>

    {errorMessage ? (
      <p className="mt-6 whitespace-pre-wrap rounded-lg border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
        {errorMessage}
      </p>
    ) : null}

    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-400">토큰 응답</h2>
        <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-300">
          {tokenData ? JSON.stringify(tokenData, null, 2) : "—"}
        </pre>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-400">주가 응답</h2>
        <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-300">
          {stockData ? JSON.stringify(stockData, null, 2) : "—"}
        </pre>
      </section>
    </div>
  </main>
);
