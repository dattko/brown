import { fetchKisDomesticInquirePriceFromEnv } from "@/entities/kis/api/inquire-domestic-price";
import { getKisRestEnv, KIS_REST_ENV_MISSING } from "@/entities/kis/config/rest-env";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  if (!getKisRestEnv()) {
    return NextResponse.json({ error: KIS_REST_ENV_MISSING }, { status: 503 });
  }

  try {
    const data = await fetchKisDomesticInquirePriceFromEnv();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = formatAxiosLikeError(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
};
