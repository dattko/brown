import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { getKisRestEnv, KIS_REST_ENV_MISSING } from "../config/rest-env";
import { getKisAccessTokenPayload } from "./access-token";

/**
 * KIS REST 호출(인증 TR). 서버 전용 — 브라우저 import 금지.
 *
 * @example
 * await kisHttp.get("/uapi/domestic-stock/v1/quotations/inquire-price", {
 *   headers: { tr_id: "FHKST01010100" },
 *   params: { fid_cond_mrkt_div_code: "J", fid_input_iscd: "005930" },
 * });
 *
 * tokenP(OAuth)는 Bearer 없음 → `kis-public-http` 의 `kisPublicPost`.
 */

let singleton: AxiosInstance | null = null;

/**
 * KIS REST용 axios 단일 인스턴스.
 * 모든 요청에 appkey/appsecret · Bearer(access_token · 캐시) 자동 추가.
 * TR별 헤더(`tr_id` 등)는 호출 시 `headers` 로 넘기면 기존 값과 합쳐짐.
 */
export const getKisAxios = (): AxiosInstance => {
  if (singleton) return singleton;

  const env = getKisRestEnv();
  if (!env) {
    throw new Error(KIS_REST_ENV_MISSING);
  }

  const client = axios.create({
    baseURL: env.baseUrl,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
      custtype: "P",
    },
  });

  client.interceptors.request.use(async (config) => {
    const e = getKisRestEnv();
    if (!e) {
      throw new Error(KIS_REST_ENV_MISSING);
    }
    const { access_token } = await getKisAccessTokenPayload();
    const next = AxiosHeaders.from(config.headers);
    next.set("authorization", `Bearer ${access_token}`);
    next.set("appkey", e.appKey);
    next.set("appsecret", e.appSecret);
    config.headers = next;
    return config;
  });

  singleton = client;
  return client;
};

export const kisGet = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await getKisAxios().get<T>(url, config);
  return data;
};

export const kisPost = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxios().post<T>(url, body, config);
  return data;
};

export const kisPut = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxios().put<T>(url, body, config);
  return data;
};

export const kisPatch = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxios().patch<T>(url, body, config);
  return data;
};

export const kisDelete = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const { data } = await getKisAxios().delete<T>(url, config);
  return data;
};

/** 자사 Base fetcher 패턴과 유사하게 묶어둠 */
export const kisHttp = {
  get: kisGet,
  post: kisPost,
  put: kisPut,
  patch: kisPatch,
  delete: kisDelete,
} as const;
