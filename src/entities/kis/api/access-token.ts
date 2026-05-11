import {
  getKisRestEnv,
  KIS_REST_ENV_MISSING,
  type KisRestEnv,
} from "../config/rest-env";
import type { GetKisTokenResult, KisTokenResponse } from "../model/types";
import { kisPublicPostFor } from "./kis-public-http";

/** mode + baseUrl + appKey 별로 토큰 캐시 (실전/모의 분리, dev process 동안 유지) */
const cache = new Map<string, { accessToken: string; expiresAtMs: number }>();
/** 동시 캐시 미스시 발급 1회 보장 */
const inflight = new Map<string, Promise<KisTokenResponse>>();

/** 만료까지 이 여유(ms) 미만이면 재발급 */
const REFRESH_MARGIN_MS = 60_000;

const cacheKey = (env: KisRestEnv) =>
  `${env.mode}:${env.baseUrl}::${env.appKey}`;

const postToken = async (env: KisRestEnv): Promise<KisTokenResponse> => {
  const data = await kisPublicPostFor<KisTokenResponse>(env, "/oauth2/tokenP", {
    grant_type: "client_credentials",
    appkey: env.appKey,
    appsecret: env.appSecret,
  });

  if (!data?.access_token) {
    throw new Error(`access_token 없음: ${JSON.stringify(data).slice(0, 400)}`);
  }

  return data;
};

/**
 * KIS 접근토큰 발급은 분당 횟수 제한이 있어 프로세스 메모리에 보관 후 재사용.
 * `expires_in` 기준 만료 직전에만 다시 발급.
 */
export const getKisAccessTokenFor = async (
  env: KisRestEnv,
): Promise<GetKisTokenResult> => {
  const key = cacheKey(env);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAtMs > now + REFRESH_MARGIN_MS) {
    return {
      access_token: hit.accessToken,
      token_type: "Bearer",
      expires_in: Math.max(0, Math.floor((hit.expiresAtMs - now) / 1000)),
      fromCache: true,
    };
  }

  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      const data = await postToken(env);
      const receivedAt = Date.now();
      const apiTtlSec =
        typeof data.expires_in === "number" && data.expires_in > 120
          ? data.expires_in
          : 3600;
      const storeSec = Math.max(300, apiTtlSec - 120);
      cache.set(key, {
        accessToken: data.access_token,
        expiresAtMs: receivedAt + storeSec * 1000,
      });
      return data;
    })().finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, p);
  }

  const data = await p;
  return { ...data, fromCache: false };
};

export const getKisAccessTokenPayloadFor = async (
  env: KisRestEnv,
): Promise<KisTokenResponse> => {
  const { access_token, token_type, expires_in } = await getKisAccessTokenFor(env);
  return { access_token, token_type, expires_in };
};

const requireMockEnv = (): KisRestEnv => {
  const env = getKisRestEnv("mock");
  if (!env) throw new Error(KIS_REST_ENV_MISSING);
  return env;
};

/** 하위호환: mock 키 셋으로 호출 */
export const getKisAccessToken = async (): Promise<GetKisTokenResult> =>
  getKisAccessTokenFor(requireMockEnv());

export const getKisAccessTokenPayload = async (): Promise<KisTokenResponse> =>
  getKisAccessTokenPayloadFor(requireMockEnv());
