import { fetchFluctuationRanking } from "./fluctuation-rank";
import { fetchKisBalance } from "./inquire-balance";
import { fetchVolumeRanking } from "./volume-rank";

export type StockSearchHit = {
  ticker: string;
  name: string;
};

const normalizeTicker = (raw: string): string | null => {
  const d = raw.replace(/\D/g, "").slice(0, 6);
  return d.length === 6 ? d : null;
};

const put = (map: Map<string, StockSearchHit>, ticker: string, name: string) => {
  const t = normalizeTicker(ticker);
  if (!t || !name?.trim()) return;
  if (!map.has(t)) map.set(t, { ticker: t, name: name.trim() });
};

/**
 * 순위·잔고 API에서 이미 내려받는 종목만 모아 검색 풀을 만듭니다.
 * (KIS 별도 “키워드 검색” TR 없이도 동작하도록)
 */
export const collectStockSearchCandidates = async (): Promise<StockSearchHit[]> => {
  const map = new Map<string, StockSearchHit>();

  const addRanking = async () => {
    const settled = await Promise.allSettled([
      fetchVolumeRanking("amount"),
      fetchVolumeRanking("volume"),
      fetchFluctuationRanking("up"),
      fetchFluctuationRanking("down"),
    ]);
    for (const r of settled) {
      if (r.status !== "fulfilled") continue;
      for (const it of r.value.items) put(map, it.ticker, it.name);
    }
  };

  await addRanking();

  try {
    const bal = await fetchKisBalance();
    for (const h of bal.holdings) put(map, h.ticker, h.name);
  } catch {
    /* 잔고 미설정 등 */
  }

  return [...map.values()];
};

const scoreHit = (hit: StockSearchHit, qRaw: string): number => {
  const q = qRaw.trim().toLowerCase();
  if (!q) return 0;
  const digits = qRaw.replace(/\D/g, "");
  const t = hit.ticker;
  const n = hit.name.toLowerCase();

  if (digits.length === 6 && t === digits) return 100;
  if (digits.length > 0 && t.startsWith(digits)) return 80 + Math.min(digits.length, 6);
  if (digits.length >= 3 && t.includes(digits)) return 62;
  if (n.includes(q)) return 50;
  if (t.toLowerCase().includes(q)) return 40;
  return 0;
};

export const filterStockSearchHits = (candidates: StockSearchHit[], query: string, limit = 24): StockSearchHit[] => {
  const q = query.trim();
  if (!q) return [];
  const scored = candidates
    .map((hit) => ({ hit, s: scoreHit(hit, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.hit.ticker.localeCompare(b.hit.ticker));
  return scored.slice(0, limit).map((x) => x.hit);
};
