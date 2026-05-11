import {
  getKisRestEnv,
  KIS_REST_LIVE_ENV_MISSING,
} from "../config/rest-env";
import {
  signedPrdyCtrtPercent,
  type ChangeSign,
  type FluctuationDirection,
  type Ranking,
  type RankingItem,
} from "../model/ranking";
import { kisGetFor } from "./kis-http";

/**
 * 등락률 순위(상승/하락) — FHPST01700000. 실전 서버에서만 응답.
 *
 * KIS 응답은 정렬/필터가 화면 기대와 어긋날 수 있어, 전일대비율은 부호 정규화 후
 * 클라이언트 규칙(상승만 / 하락만, 정렬, 상한 N건)으로 다시 만든다.
 */

const OUTPUT_LIMIT = 30;

type KisFluctuationRow = {
  stck_shrn_iscd: string;
  hts_kor_isnm: string;
  data_rank: string;
  stck_prpr: string;
  prdy_vrss_sign: string;
  prdy_vrss: string;
  prdy_ctrt: string;
  acml_vol: string;
  acml_tr_pbmn: string;
};

type KisFluctuationResponse = {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output?: KisFluctuationRow[];
};

const toNumber = (s?: string): number => {
  if (s === undefined || s === null || s === "") return 0;
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/**
 * direction → FID_RANK_SORT_CLS_CODE (전일 종가 대비)
 *   0: 상승률, 1: 하락률 — 초기 집합 확보용. 최종 목록은 아래에서 재필터·재정렬.
 */
const directionToCode = (d: FluctuationDirection) => (d === "up" ? "0" : "1");

const mapRow = (row: KisFluctuationRow, i: number): RankingItem => {
  const changeRate = signedPrdyCtrtPercent(row);
  const changeSign: ChangeSign =
    changeRate > 0 ? "up" : changeRate < 0 ? "down" : "flat";
  return {
    rank: toNumber(row.data_rank) || i + 1,
    ticker: row.stck_shrn_iscd,
    name: row.hts_kor_isnm,
    price: toNumber(row.stck_prpr),
    changeAmount: toNumber(row.prdy_vrss),
    changeRate,
    changeSign,
    volume: toNumber(row.acml_vol),
    amount: toNumber(row.acml_tr_pbmn),
  };
};

const finalize = (
  direction: FluctuationDirection,
  raw: RankingItem[],
): RankingItem[] => {
  if (direction === "down") {
    return [...raw]
      .filter((row) => row.changeRate < 0)
      .sort((a, b) => a.changeRate - b.changeRate)
      .slice(0, OUTPUT_LIMIT)
      .map((row, i) => ({ ...row, rank: i + 1 }));
  }
  return [...raw]
    .filter((row) => row.changeRate > 0)
    .sort((a, b) => b.changeRate - a.changeRate)
    .slice(0, OUTPUT_LIMIT)
    .map((row, i) => ({ ...row, rank: i + 1 }));
};

export const fetchFluctuationRanking = async (
  direction: FluctuationDirection = "up",
): Promise<Ranking> => {
  const env = getKisRestEnv("live");
  if (!env) throw new Error(KIS_REST_LIVE_ENV_MISSING);

  const data = await kisGetFor<KisFluctuationResponse>(
    env,
    "/uapi/domestic-stock/v1/ranking/fluctuation",
    {
      headers: { tr_id: "FHPST01700000", custtype: "P" },
      params: {
        FID_COND_MRKT_DIV_CODE: "J",
        FID_COND_SCR_DIV_CODE: "20170",
        FID_INPUT_ISCD: "0000",
        FID_RANK_SORT_CLS_CODE: directionToCode(direction),
        /** 출력 건수. 0은 KIS 기본 */
        FID_INPUT_CNT_1: "0",
        FID_PRC_CLS_CODE: "0",
        FID_INPUT_PRICE_1: "",
        FID_INPUT_PRICE_2: "",
        FID_VOL_CNT: "",
        FID_TRGT_CLS_CODE: "0",
        FID_TRGT_EXLS_CLS_CODE: "0",
        FID_DIV_CLS_CODE: "0",
        FID_RSFL_RATE1: "",
        FID_RSFL_RATE2: "",
      },
    },
  );

  if (data.rt_cd !== "0") {
    throw new Error(`등락률 순위 실패(${data.msg_cd}): ${data.msg1}`);
  }

  const mapped = (data.output ?? []).map(mapRow);
  const items = finalize(direction, mapped);

  return { kind: direction === "up" ? "rise" : "fall", items };
};
