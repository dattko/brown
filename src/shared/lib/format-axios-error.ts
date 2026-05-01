import axios from "axios";

/** KIS 라우트 등에서 axios/일반 에러를 JSON용 문자열로 통일 */
export const formatAxiosLikeError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return (
      (err.response?.data as { message?: string })?.message ??
      JSON.stringify(err.response?.data ?? err.message)
    );
  }
  if (err instanceof Error) return err.message;
  return String(err);
};
