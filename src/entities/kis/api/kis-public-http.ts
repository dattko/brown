/** OAuth tokenP 등 — Bearer 미부착. `kis-http`(인증 클라이언트)와 분리해 순환 참조 없음 */

import axios, { type AxiosInstance } from "axios";
import { getKisRestEnv, KIS_REST_ENV_MISSING } from "../config/rest-env";

let publicSingleton: AxiosInstance | null = null;

/** 접근토큰 발급 전용 등, 인증 인터셉터 없음 */
export const getKisPublicAxios = (): AxiosInstance => {
  if (publicSingleton) return publicSingleton;

  const env = getKisRestEnv();
  if (!env) {
    throw new Error(KIS_REST_ENV_MISSING);
  }

  publicSingleton = axios.create({
    baseURL: env.baseUrl,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
    },
  });

  return publicSingleton;
};

export const kisPublicPost = async <T = unknown>(
  url: string,
  body?: unknown,
): Promise<T> => {
  const { data } = await getKisPublicAxios().post<T>(url, body);
  return data;
};
