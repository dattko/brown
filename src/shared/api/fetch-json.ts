export type Json =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const safeParse = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
};

/** 내부 API 호출용 공통 fetch. 비-2xx면 ApiError, JSON 아니면 원문 문자열을 body로 보존. */
export const fetchJson = async <T = Json>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(input, init);
  const text = await res.text();
  const body: unknown = text ? safeParse(text) : null;

  if (!res.ok) {
    const errorField = (body as { error?: unknown } | null)?.error;
    const message =
      typeof errorField === "string"
        ? errorField
        : text || res.statusText || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
};
