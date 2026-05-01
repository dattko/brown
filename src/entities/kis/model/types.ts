/** KIS OAuth tokenP 본문(일부 필드만) */
export type KisTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

export type GetKisTokenResult = KisTokenResponse & {
  /** true면 캐시 히트(새로 tokenP 호출 안 함) */
  fromCache: boolean;
};
