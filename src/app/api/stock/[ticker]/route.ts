import { fetchKisDomesticInquirePrice } from "@/entities/kis/api/inquire-domestic-price";
import { getKisRestEnv, KIS_REST_ENV_MISSING } from "@/entities/kis/config/rest-env";
import { parseKisInquirePriceResponse } from "@/entities/kis/model/stock-quote";
import { formatAxiosLikeError } from "@/shared/lib/format-axios-error";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const normalizeTicker = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 6) return null;
  return digits;
};

export const GET = async (
  _req: NextRequest,
  ctx: { params: Promise<{ ticker: string }> },
) => {
  const { ticker: raw } = await ctx.params;
  const ticker = normalizeTicker(raw);
  if (!ticker) {
    return NextResponse.json(
      { error: "6자리 숫자 종목코드만 조회할 수 있습니다." },
      { status: 400 },
    );
  }

  if (!getKisRestEnv()) {
    return NextResponse.json({ error: KIS_REST_ENV_MISSING }, { status: 503 });
  }

  try {
    const data = await fetchKisDomesticInquirePrice(ticker);
    const parsed = parseKisInquirePriceResponse(data, ticker);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }
    return NextResponse.json({ quote: parsed.quote, raw: data });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: formatAxiosLikeError(err) },
      { status: 502 },
    );
  }
};
