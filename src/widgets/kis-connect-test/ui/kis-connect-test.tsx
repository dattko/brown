"use client";

import { useCallback, useState } from "react";

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

const readJson = async (res: Response): Promise<{ ok: boolean; data: Json }> => {
  const data = (await res.json()) as Json;
  return { ok: res.ok, data };
};

export const KisConnectTest = () => {
  const [tokenResult, setTokenResult] = useState<Json | null>(null);
  const [stockResult, setStockResult] = useState<Json | null>(null);
  const [busy, setBusy] = useState<null | "token" | "stock" | "both">(null);
  const [error, setError] = useState<string | null>(null);

  const loadToken = useCallback(async () => {
    setError(null);
    setBusy("token");
    try {
      const { ok, data } = await readJson(await fetch("/api/token"));
      setTokenResult(data);
      if (!ok) {
        setError(
          typeof (data as { error?: string }).error === "string"
            ? (data as { error: string }).error
            : JSON.stringify(data),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }, []);

  const loadStock = useCallback(async () => {
    setError(null);
    setBusy("stock");
    try {
      const { ok, data } = await readJson(await fetch("/api/stock"));
      setStockResult(data);
      if (!ok) {
        setError(
          typeof (data as { error?: string }).error === "string"
            ? (data as { error: string }).error
            : JSON.stringify(data),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }, []);

  const loadBoth = useCallback(async () => {
    setError(null);
    setBusy("both");
    try {
      const [t, s] = await Promise.all([fetch("/api/token"), fetch("/api/stock")]);
      const tr = await readJson(t);
      const sr = await readJson(s);
      setTokenResult(tr.data);
      setStockResult(sr.data);
      const parts: string[] = [];
      if (!tr.ok) parts.push(`토큰: ${JSON.stringify(tr.data)}`);
      if (!sr.ok) parts.push(`주가: ${JSON.stringify(sr.data)}`);
      if (parts.length) setError(parts.join("\n"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }, []);

  return (
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
          disabled={busy !== null}
          onClick={loadToken}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy === "token" ? "불러오는 중…" : "토큰 조회"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={loadStock}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {busy === "stock" ? "불러오는 중…" : "주가 조회 (삼성전자)"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={loadBoth}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-900 disabled:opacity-50"
        >
          {busy === "both" ? "불러오는 중…" : "둘 다"}
        </button>
      </div>

      {error ? (
        <p className="mt-6 whitespace-pre-wrap rounded-lg border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-medium text-zinc-400">토큰 응답</h2>
          <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-300">
            {tokenResult ? JSON.stringify(tokenResult, null, 2) : "—"}
          </pre>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-medium text-zinc-400">주가 응답</h2>
          <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-300">
            {stockResult ? JSON.stringify(stockResult, null, 2) : "—"}
          </pre>
        </section>
      </div>
    </main>
  );
};
