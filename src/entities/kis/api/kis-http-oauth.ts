import axios, { type AxiosInstance } from "axios";
import { getKisRestEnv, KIS_REST_ENV_MISSING } from "../config/rest-env";

/** OAuth(tokenP 등)만 — Bearer 인터셉터 없음. `kis-http` 와 순환 참조 피함. */

let oauthSingleton: AxiosInstance | null = null;

export const getKisOAuthAxios = (): AxiosInstance => {
  if (oauthSingleton) return oauthSingleton;

  const env = getKisRestEnv();
  if (!env) {
    throw new Error(KIS_REST_ENV_MISSING);
  }

  oauthSingleton = axios.create({
    baseURL: env.baseUrl,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
    },
  });

  return oauthSingleton;
};

export const kisOAuthPost = async <T = unknown>(
  relativePath: string,
  body: unknown,
): Promise<T> => {
  const { data } = await getKisOAuthAxios().post<T>(relativePath, body);
  return data;
};
