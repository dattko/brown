import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StockDetailView } from "@/features/stock-detail";

type PageProps = {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ name?: string }>;
};

const normalizeTicker = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  return digits.length === 6 ? digits : null;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker: raw } = await params;
  const ticker = normalizeTicker(raw);
  return {
    title: ticker ? `${ticker} · 종목 · Brown` : "종목 · Brown",
  };
}

export default async function StockDetailPage({ params, searchParams }: PageProps) {
  const { ticker: raw } = await params;
  const { name } = await searchParams;
  const ticker = normalizeTicker(raw);
  if (!ticker) {
    notFound();
  }

  return (
    <main className="min-h-[60vh]">
      <StockDetailView ticker={ticker} initialName={name} />
    </main>
  );
}
