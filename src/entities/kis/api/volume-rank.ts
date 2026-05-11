import {
  getKisRestEnv,
  KIS_REST_LIVE_ENV_MISSING,
} from "../config/rest-env";
import {
  toChangeSign,
  type Ranking,
  type RankingItem,
  type VolumeRankSort,
} from "../model/ranking";
import { kisGetFor } from "./kis-http";

/**
 * 거래량/거래대금 순위 (FHPST01710000) — 실전 서버에서만 응답.
 */

type KisVolumeRankRow = {
  hts_kor_isnm: string;
  mksc_shrn_iscd: string;
  data_rank: string;
  stck_prpr: string;
  prdy_vrss_sign: string;
  prdy_vrss: string;
  prdy_ctrt: string;
  acml_vol: string;
  acml_tr_pbmn: string;
};

type KisVolumeRankResponse = {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output?: KisVolumeRankRow[];
};

const toNumber = (s?: string): number => {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

/** sort → FID_BLNG_CLS_CODE: 0(평균거래량) / 3(거래금액순) */
const sortToBlngCode = (sort: VolumeRankSort): string =>
  sort === "amount" ? "3" : "0";

export const fetchVolumeRanking = async (
  sort: VolumeRankSort = "volume",
): Promise<Ranking> => {
  const env = getKisRestEnv("live");
  if (!env) throw new Error(KIS_REST_LIVE_ENV_MISSING);

  const data = await kisGetFor<KisVolumeRankResponse>(
    env,
    "/uapi/domestic-stock/v1/quotations/volume-rank",
    {
      headers: { tr_id: "FHPST01710000", custtype: "P" },
      params: {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_COND_SCR_DIV_CODE: "20171",
        FID_INPUT_ISCD: "0000",
        FID_DIV_CLS_CODE: "0",
        FID_BLNG_CLS_CODE: sortToBlngCode(sort),
        FID_TRGT_CLS_CODE: "111111111",
        FID_TRGT_EXLS_CLS_CODE: "0000000000",
        FID_INPUT_PRICE_1: "",
        FID_INPUT_PRICE_2: "",
        FID_VOL_CNT: "",
        FID_INPUT_DATE_1: "",
      },
    },
  );

  if (data.rt_cd !== "0") {
    throw new Error(`거래량 순위 실패(${data.msg_cd}): ${data.msg1}`);
  }

  const items: RankingItem[] = (data.output ?? []).map((row, i) => ({
    rank: toNumber(row.data_rank) || i + 1,
    ticker: row.mksc_shrn_iscd,
    name: row.hts_kor_isnm,
    price: toNumber(row.stck_prpr),
    changeAmount: toNumber(row.prdy_vrss),
    changeRate: toNumber(row.prdy_ctrt),
    changeSign: toChangeSign(row.prdy_vrss_sign),
    volume: toNumber(row.acml_vol),
    amount: toNumber(row.acml_tr_pbmn),
  }));

  return { kind: sort, items };
};
