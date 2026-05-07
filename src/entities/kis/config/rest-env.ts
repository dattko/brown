export type KisRestEnv = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  ticker: string;
  cano: string | null;
  acntPrdtCd: string | null;
  /** baseUrl이 모의투자 도메인이면 true */
  isMock: boolean;
};

const isMockBaseUrl = (baseUrl: string) =>
  /openapivts\.koreainvestment/i.test(baseUrl);

export const getKisRestEnv = (): KisRestEnv | null => {
  const baseUrl = process.env.KIS_BASE_URL?.replace(/\/$/, "");
  const appKey = process.env.KIS_APP_KEY?.trim();
  const appSecret = process.env.KIS_APP_SECRET?.trim();
  const ticker = process.env.KIS_STOCK_TICKER?.trim() || "005930";
  const cano = process.env.KIS_CANO?.trim() || null;
  const acntPrdtCd = process.env.KIS_ACNT_PRDT_CD?.trim() || null;

  if (!baseUrl || !appKey || !appSecret) {
    return null;
  }

  return {
    baseUrl,
    appKey,
    appSecret,
    ticker,
    cano,
    acntPrdtCd,
    isMock: isMockBaseUrl(baseUrl),
  };
};

export const KIS_REST_ENV_MISSING =
  "KIS_BASE_URL, KIS_APP_KEY, KIS_APP_SECRET를 설정하세요.";

export const KIS_REST_ACCOUNT_MISSING =
  "KIS_CANO(계좌번호 앞 8자리), KIS_ACNT_PRDT_CD(상품코드 2자리, 보통 01)를 .env.local에 설정하세요.";
