export type KisRestEnv = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  ticker: string;
};

export const getKisRestEnv = (): KisRestEnv | null => {
  const baseUrl = process.env.KIS_BASE_URL?.replace(/\/$/, "");
  const appKey = process.env.KIS_APP_KEY?.trim();
  const appSecret = process.env.KIS_APP_SECRET?.trim();
  const ticker = process.env.KIS_STOCK_TICKER?.trim() || "005930";

  if (!baseUrl || !appKey || !appSecret) {
    return null;
  }

  return { baseUrl, appKey, appSecret, ticker };
};

export const KIS_REST_ENV_MISSING =
  "KIS_BASE_URL, KIS_APP_KEY, KIS_APP_SECRET를 설정하세요.";
