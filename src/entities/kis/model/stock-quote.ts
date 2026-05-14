/** KIS inquire-price 응답에서 꺼내 쓰는 요약 (필드명은 API 스펙 기준) */

export type StockQuoteDetail = {
  ticker: string;
  name: string | null;
  currentPrice: number | null;
  /** 전일 대비(원) */
  changeFromPrev: number | null;
  /** 전일 대비율(%) */
  changeRatePercent: number | null;
  /** 누적 거래량(주) */
  volume: number | null;
  /** 누적 거래대금(원) */
  tradeValue: number | null;
};

const num = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/**
 * `GET /uapi/domestic-stock/v1/quotations/inquire-price` JSON 본문 파싱.
 * `rt_cd !== "0"` 이면 `{ error }` 형태로 반환.
 */
export const parseKisInquirePriceResponse = (
  data: unknown,
  tickerFallback: string,
): { quote: StockQuoteDetail } | { error: string } => {
  if (!data || typeof data !== "object") {
    return { error: "응답 형식이 올바르지 않습니다." };
  }
  const d = data as Record<string, unknown>;
  if (d.rt_cd !== "0") {
    const msg = typeof d.msg1 === "string" ? d.msg1 : "시세 조회에 실패했습니다.";
    return { error: msg };
  }
  const out = d.output;
  if (!out || typeof out !== "object") {
    return { error: "시세 output이 없습니다." };
  }
  const o = out as Record<string, unknown>;
  const ticker = str(o.stck_shrn_iscd) ?? tickerFallback;
  const quote: StockQuoteDetail = {
    ticker,
    name: str(o.hts_kor_isnm),
    currentPrice: num(o.stck_prpr),
    changeFromPrev: num(o.prdy_vrss),
    changeRatePercent: num(o.prdy_ctrt),
    volume: num(o.acml_vol),
    tradeValue: num(o.acml_tr_pbmn),
  };
  return { quote };
};
