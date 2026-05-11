import { fetchFluctuationRanking } from "@/entities/kis/api/fluctuation-rank";
import {
  getKisRestEnv,
  KIS_REST_LIVE_ENV_MISSING,
} from "@/entities/kis/config/rest-env";
import type { FluctuationDirection } from "@/entities/kis/model/ranking";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const parseDirection = (raw: string | null): FluctuationDirection =>
  raw === "down" ? "down" : "up";

export const GET = async (req: NextRequest) => {
  if (!getKisRestEnv("live")) {
    return NextResponse.json(
      { error: KIS_REST_LIVE_ENV_MISSING },
      { status: 503 },
    );
  }

  const direction = parseDirection(req.nextUrl.searchParams.get("direction"));

  try {
    const data = await fetchFluctuationRanking(direction);
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: formatAxiosLikeError(err) },
      { status: 502 },
    );
  }
};
