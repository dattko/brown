/** OAuth tokenP 등 — Bearer 미부착. `kis-http`(인증 클라이언트)와 분리해 순환 참조 없음 */

import axios, { type AxiosInstance } from "axios";

import { getKisRestEnv, KIS_REST_ENV_MISSING } from "../config/rest-env";
import type { KisRestEnv } from "../config/rest-env";

/** mode + baseUrl 별로 단일 인스턴스 보관 */
const registry = new Map<string, AxiosInstance>();

const keyOf = (env: KisRestEnv) => `${env.mode}:${env.baseUrl}`;

const create = (env: KisRestEnv): AxiosInstance =>
  axios.create({
    baseURL: env.baseUrl,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
    },
  });

export const getKisPublicAxiosFor = (env: KisRestEnv): AxiosInstance => {
  const key = keyOf(env);
  const hit = registry.get(key);
  if (hit) return hit;
  const inst = create(env);
  registry.set(key, inst);
  return inst;
};

export const kisPublicPostFor = async <T = unknown>(
  env: KisRestEnv,
  url: string,
  body?: unknown,
): Promise<T> => {
  const { data } = await getKisPublicAxiosFor(env).post<T>(url, body);
  return data;
};

const requireMockEnv = (): KisRestEnv => {
  const env = getKisRestEnv("mock");
  if (!env) throw new Error(KIS_REST_ENV_MISSING);
  return env;
};

/** 하위호환: mock 키 셋으로 호출 */
export const getKisPublicAxios = (): AxiosInstance =>
  getKisPublicAxiosFor(requireMockEnv());

export const kisPublicPost = async <T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> => kisPublicPostFor<T>(requireMockEnv(), url, body);
