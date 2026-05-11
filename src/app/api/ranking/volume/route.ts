import { fetchVolumeRanking } from "@/entities/kis/api/volume-rank";
import {
  getKisRestEnv,
  KIS_REST_LIVE_ENV_MISSING,
} from "@/entities/kis/config/rest-env";
import type { VolumeRankSort } from "@/entities/kis/model/ranking";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const parseSort = (raw: string | null): VolumeRankSort =>
  raw === "amount" ? "amount" : "volume";

export const GET = async (req: NextRequest) => {
  if (!getKisRestEnv("live")) {
    return NextResponse.json(
      { error: KIS_REST_LIVE_ENV_MISSING },
      { status: 503 },
    );
  }

  const sort = parseSort(req.nextUrl.searchParams.get("sort"));

  try {
    const data = await fetchVolumeRanking(sort);
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: formatAxiosLikeError(err) },
      { status: 502 },
    );
  }
};
