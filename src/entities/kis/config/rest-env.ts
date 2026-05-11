export type KisMode = "mock" | "live";

export type KisRestEnv = {
  /** 어떤 키 셋을 쓴 환경인지 */
  mode: KisMode;
  /** mode === "mock" 일 때 true */
  isMock: boolean;
  baseUrl: string;
  appKey: string;
  appSecret: string;
  ticker: string;
  cano: string | null;
  acntPrdtCd: string | null;
};

const trimEnv = (k: string) => process.env[k]?.trim();
const baseUrlEnv = (k: string) => trimEnv(k)?.replace(/\/$/, "");

const buildLive = (): KisRestEnv | null => {
  const baseUrl =
    baseUrlEnv("KIS_LIVE_BASE_URL") || "https://openapi.koreainvestment.com:9443";
  const appKey = trimEnv("KIS_LIVE_APP_KEY");
  const appSecret = trimEnv("KIS_LIVE_APP_SECRET");
  if (!baseUrl || !appKey || !appSecret) return null;
  return {
    mode: "live",
    isMock: false,
    baseUrl,
    appKey,
    appSecret,
    ticker: trimEnv("KIS_STOCK_TICKER") || "005930",
    cano: trimEnv("KIS_LIVE_CANO") || null,
    acntPrdtCd: trimEnv("KIS_LIVE_ACNT_PRDT_CD") || null,
  };
};

const buildMock = (): KisRestEnv | null => {
  const baseUrl = baseUrlEnv("KIS_BASE_URL");
  const appKey = trimEnv("KIS_APP_KEY");
  const appSecret = trimEnv("KIS_APP_SECRET");
  if (!baseUrl || !appKey || !appSecret) return null;
  return {
    mode: "mock",
    isMock: true,
    baseUrl,
    appKey,
    appSecret,
    ticker: trimEnv("KIS_STOCK_TICKER") || "005930",
    cano: trimEnv("KIS_CANO") || null,
    acntPrdtCd: trimEnv("KIS_ACNT_PRDT_CD") || null,
  };
};

/**
 * 모드별 KIS REST 환경.
 * - "mock": 잔고/현재가 조회 등 모의투자 키 셋
 * - "live": 시세·순위 등 실전에서만 응답하는 API용 키 셋
 */
export const getKisRestEnv = (mode: KisMode = "mock"): KisRestEnv | null =>
  mode === "live" ? buildLive() : buildMock();

export const KIS_REST_ENV_MISSING =
  "KIS_BASE_URL, KIS_APP_KEY, KIS_APP_SECRET를 설정하세요.";

export const KIS_REST_LIVE_ENV_MISSING =
  "KIS_LIVE_BASE_URL, KIS_LIVE_APP_KEY, KIS_LIVE_APP_SECRET를 .env.local에 설정하세요.";

export const KIS_REST_ACCOUNT_MISSING =
  "KIS_CANO(계좌번호 앞 8자리), KIS_ACNT_PRDT_CD(상품코드 2자리, 보통 01)를 .env.local에 설정하세요.";
