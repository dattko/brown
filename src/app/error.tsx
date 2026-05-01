"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-6">
        <h1 className="text-lg font-semibold text-red-100">문제가 발생했습니다</h1>
        <p className="mt-2 text-sm text-red-300/90">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
};

export default ErrorPage;
