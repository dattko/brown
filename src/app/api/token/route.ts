import { getKisAccessToken } from "@/entities/kis/api/access-token";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const data = await getKisAccessToken();
    const { fromCache, ...token } = data;
    return NextResponse.json({ ...token, cached: fromCache });
  } catch (err: unknown) {
    const message = formatAxiosLikeError(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
};
