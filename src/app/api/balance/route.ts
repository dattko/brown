import { fetchKisBalance } from "@/entities/kis/api/inquire-balance";
import {
  getKisRestEnv,
  KIS_REST_ACCOUNT_MISSING,
  KIS_REST_ENV_MISSING,
} from "@/entities/kis/config/rest-env";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const env = getKisRestEnv();
  if (!env) {
    return NextResponse.json({ error: KIS_REST_ENV_MISSING }, { status: 503 });
  }
  if (!env.cano || !env.acntPrdtCd) {
    return NextResponse.json({ error: KIS_REST_ACCOUNT_MISSING }, { status: 503 });
  }

  try {
    const data = await fetchKisBalance();
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: formatAxiosLikeError(err) },
      { status: 502 },
    );
  }
};
