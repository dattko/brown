import { getKisRestEnv, KIS_REST_ENV_MISSING } from "../config/rest-env";
import { kisGet } from "./kis-http";

/** 국내 현재가 (inquire-price). 서버 전용 */
export const fetchKisDomesticInquirePrice = async (ticker: string): Promise<unknown> =>
  kisGet("/uapi/domestic-stock/v1/quotations/inquire-price", {
    headers: {
      tr_id: "FHKST01010100",
    },
    params: {
      fid_cond_mrkt_div_code: "J",
      fid_input_iscd: ticker,
    },
  });

/** 환경 변수 기준 현재가(기본 `KIS_STOCK_TICKER` 또는 삼성전자) */
export const fetchKisDomesticInquirePriceFromEnv = async (): Promise<unknown> => {
  const env = getKisRestEnv();
  if (!env) {
    throw new Error(KIS_REST_ENV_MISSING);
  }
  return fetchKisDomesticInquirePrice(env.ticker);
};
