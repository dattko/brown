import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

import {
  getKisRestEnv,
  KIS_REST_ENV_MISSING,
  type KisRestEnv,
} from "../config/rest-env";
import { getKisAccessTokenPayloadFor } from "./access-token";

/**
 * KIS REST 호출(인증 TR). 서버 전용 — 브라우저 import 금지.
 *
 * - `kisHttp.*` : mock 기본 (잔고/현재가 등)
 * - `kisHttpFor(env)` : 임의 env (실전 키 셋 등)
 *
 * tokenP(OAuth)는 Bearer 없음 → `kis-public-http` 의 `kisPublicPostFor`.
 */

/** mode + baseUrl + appKey 별 단일 인스턴스 */
const registry = new Map<string, AxiosInstance>();

const keyOf = (env: KisRestEnv) => `${env.mode}:${env.baseUrl}::${env.appKey}`;

const create = (env: KisRestEnv): AxiosInstance => {
  const client = axios.create({
    baseURL: env.baseUrl,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
      custtype: "P",
    },
  });

  client.interceptors.request.use(async (config) => {
    const { access_token } = await getKisAccessTokenPayloadFor(env);
    const next = AxiosHeaders.from(config.headers);
    next.set("authorization", `Bearer ${access_token}`);
    next.set("appkey", env.appKey);
    next.set("appsecret", env.appSecret);
    config.headers = next;
    return config;
  });

  return client;
};

export const getKisAxiosFor = (env: KisRestEnv): AxiosInstance => {
  const key = keyOf(env);
  const hit = registry.get(key);
  if (hit) return hit;
  const inst = create(env);
  registry.set(key, inst);
  return inst;
};

export const kisGetFor = async <T = unknown>(
  env: KisRestEnv,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxiosFor(env).get<T>(url, config);
  return data;
};

export const kisPostFor = async <T = unknown>(
  env: KisRestEnv,
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxiosFor(env).post<T>(url, body, config);
  return data;
};

export const kisPutFor = async <T = unknown>(
  env: KisRestEnv,
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxiosFor(env).put<T>(url, body, config);
  return data;
};

export const kisPatchFor = async <T = unknown>(
  env: KisRestEnv,
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxiosFor(env).patch<T>(url, body, config);
  return data;
};

export const kisDeleteFor = async <T = unknown>(
  env: KisRestEnv,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await getKisAxiosFor(env).delete<T>(url, config);
  return data;
};

const requireMockEnv = (): KisRestEnv => {
  const env = getKisRestEnv("mock");
  if (!env) throw new Error(KIS_REST_ENV_MISSING);
  return env;
};

/** 하위호환(mock 기본) */
export const getKisAxios = (): AxiosInstance => getKisAxiosFor(requireMockEnv());

export const kisGet = async <T = unknown>(url: string, config?: AxiosRequestConfig) =>
  kisGetFor<T>(requireMockEnv(), url, config);

export const kisPost = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => kisPostFor<T>(requireMockEnv(), url, body, config);

export const kisPut = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => kisPutFor<T>(requireMockEnv(), url, body, config);

export const kisPatch = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) => kisPatchFor<T>(requireMockEnv(), url, body, config);

export const kisDelete = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
) => kisDeleteFor<T>(requireMockEnv(), url, config);

export const kisHttp = {
  get: kisGet,
  post: kisPost,
  put: kisPut,
  patch: kisPatch,
  delete: kisDelete,
} as const;

export const kisHttpFor = (env: KisRestEnv) =>
  ({
    get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      kisGetFor<T>(env, url, config),
    post: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      kisPostFor<T>(env, url, body, config),
    put: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      kisPutFor<T>(env, url, body, config),
    patch: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      kisPatchFor<T>(env, url, body, config),
    delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      kisDeleteFor<T>(env, url, config),
  }) as const;
