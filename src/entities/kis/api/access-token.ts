import type { GetKisTokenResult, KisTokenResponse } from "../model/types";
import { kisPublicPost } from "./kis-public-http";

/** appkey별로 저장. Next dev / 단일 노드에서는 프로세스가 살아 있는 동안 유지됨 */
const cache = new Map<string, { accessToken: string; expiresAtMs: number }>();
/** 동시에 캐시 미스 여러 번이면 발급 1회만 하도록 */
const inflight = new Map<string, Promise<KisTokenResponse>>();

/** 만료까지 이 여유(ms) 미만이면 재발급 */
const REFRESH_MARGIN_MS = 60_000;

const cacheKey = (baseUrl: string, appKey: string) => `${baseUrl}::${appKey}`;

const postToken = async (appKey: string, appSecret: string): Promise<KisTokenResponse> => {
  const data = await kisPublicPost<KisTokenResponse>("/oauth2/tokenP", {
    grant_type: "client_credentials",
    appkey: appKey,
    appsecret: appSecret,
  });

  if (!data?.access_token) {
    throw new Error(`access_token 없음: ${JSON.stringify(data).slice(0, 400)}`);
  }

  return data;
};

/**
 * KIS는 접근토큰 발급이 **1분당 1회** 등으로 제한됨 → 프로세스 메모리에 보관 후 재사용.
 * `expires_in` 기준으로 만료 직전에만 다시 발급.
 */
export const getKisAccessToken = async (): Promise<GetKisTokenResult> => {
  const baseUrl = process.env.KIS_BASE_URL?.replace(/\/$/, "");
  const appKey = process.env.KIS_APP_KEY?.trim();
  const appSecret = process.env.KIS_APP_SECRET?.trim();

  if (!baseUrl || !appKey || !appSecret) {
    throw new Error("KIS_BASE_URL, KIS_APP_KEY, KIS_APP_SECRET를 .env.local에 설정하세요.");
  }

  const key = cacheKey(baseUrl, appKey);
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
      const data = await postToken(appKey, appSecret);
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

/** 라우트/다른 서버 코드에서 타입 분리만 필요할 때 (캐시 동일 적용) */
export const getKisAccessTokenPayload = async (): Promise<KisTokenResponse> => {
  const { access_token, token_type, expires_in } = await getKisAccessToken();
  return { access_token, token_type, expires_in };
};
