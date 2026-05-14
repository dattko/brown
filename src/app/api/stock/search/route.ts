import {
  collectStockSearchCandidates,
  filterStockSearchHits,
} from "@/entities/kis/api/stock-search-candidates";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 45_000;
let cache: { at: number; candidates: Awaited<ReturnType<typeof collectStockSearchCandidates>> } | null =
  null;

const getCandidatesCached = async () => {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.candidates;
  }
  const candidates = await collectStockSearchCandidates();
  cache = { at: Date.now(), candidates };
  return candidates;
};

export const GET = async (req: NextRequest) => {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ items: [] });
  }
  if (q.length > 40) {
    return NextResponse.json({ error: "검색어는 40자 이하로 입력하세요." }, { status: 400 });
  }

  try {
    const candidates = await getCandidatesCached();
    const items = filterStockSearchHits(candidates, q);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: formatAxiosLikeError(err), items: [] },
      { status: 502 },
    );
  }
};
