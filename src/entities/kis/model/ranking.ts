export type RankingKind = "amount" | "volume" | "rise" | "fall";

export type ChangeSign = "up" | "down" | "flat";

export type RankingItem = {
  rank: number;
  ticker: string;
  name: string;
  /** 현재가(원) */
  price: number;
  /** 전일대비(원, 부호 포함) */
  changeAmount: number;
  /** 전일대비율(%, 부호 포함) */
  changeRate: number;
  changeSign: ChangeSign;
  /** 누적 거래량(주) */
  volume: number;
  /** 누적 거래대금(원) */
  amount: number;
};

export type Ranking = {
  kind: RankingKind;
  items: RankingItem[];
};

export type VolumeRankSort = "amount" | "volume";
export type FluctuationDirection = "up" | "down";

/** KIS prdy_vrss_sign(1상한/2상승/3보합/4하한/5하락) → 도메인 부호 */
export const toChangeSign = (sign: string | undefined): ChangeSign => {
  if (sign === "1" || sign === "2") return "up";
  if (sign === "4" || sign === "5") return "down";
  return "flat";
};

/**
 * KIS는 `prdy_ctrt`를 절댓값만 주고 방향은 `prdy_vrss_sign`에 두는 경우가 많음.
 * 부호를 맞춘 전일대비율(%).
 */
export const signedPrdyCtrtPercent = (row: {
  prdy_ctrt?: string;
  prdy_vrss_sign?: string;
  prdy_vrss?: string;
}): number => {
  const rawAbs = Math.abs(
    Number(String(row.prdy_ctrt ?? "").replace(/,/g, "")) || 0,
  );
  const s = row.prdy_vrss_sign?.trim();
  if (s === "1" || s === "2") return rawAbs;
  if (s === "4" || s === "5") return -rawAbs;
  if (s === "3") return 0;
  const vrss = Number(String(row.prdy_vrss ?? "").replace(/,/g, "")) || 0;
  if (vrss > 0) return rawAbs;
  if (vrss < 0) return -rawAbs;
  const raw = Number(String(row.prdy_ctrt ?? "").replace(/,/g, "")) || 0;
  return Number.isFinite(raw) ? raw : 0;
};
