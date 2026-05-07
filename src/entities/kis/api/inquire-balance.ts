import {
  getKisRestEnv,
  KIS_REST_ACCOUNT_MISSING,
  KIS_REST_ENV_MISSING,
} from "../config/rest-env";
import type {
  KisAccountSummary,
  KisBalance,
  KisHolding,
} from "../model/balance";
import { kisGet } from "./kis-http";

/**
 * 주식잔고조회 (국내) — 모의/실전 자동 분기.
 * Doc: https://apiportal.koreainvestment.com/apiservice/...inquire-balance
 */

type KisHoldingRow = {
  pdno: string;
  prdt_name: string;
  hldg_qty: string;
  ord_psbl_qty?: string;
  pchs_avg_pric: string;
  pchs_amt: string;
  prpr: string;
  evlu_amt: string;
  evlu_pfls_amt: string;
  evlu_pfls_rt: string;
  evlu_erng_rt?: string;
  fltt_rt?: string;
};

type KisAccountSummaryRow = {
  dnca_tot_amt: string;
  tot_evlu_amt: string;
  pchs_amt_smtl_amt: string;
  evlu_amt_smtl_amt: string;
  evlu_pfls_smtl_amt: string;
  nass_amt: string;
  tot_stck_evlu_amt?: string;
  scts_evlu_amt?: string;
};

type KisInquireBalanceResponse = {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output1?: KisHoldingRow[];
  output2?: KisAccountSummaryRow[];
};

const toNumber = (s?: string): number => {
  if (s === undefined || s === null || s === "") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

export const fetchKisBalance = async (): Promise<KisBalance> => {
  const env = getKisRestEnv();
  if (!env) throw new Error(KIS_REST_ENV_MISSING);
  if (!env.cano || !env.acntPrdtCd) throw new Error(KIS_REST_ACCOUNT_MISSING);

  const trId = env.isMock ? "VTTC8434R" : "TTTC8434R";

  const data = await kisGet<KisInquireBalanceResponse>(
    "/uapi/domestic-stock/v1/trading/inquire-balance",
    {
      headers: {
        tr_id: trId,
        custtype: "P",
      },
      params: {
        CANO: env.cano,
        ACNT_PRDT_CD: env.acntPrdtCd,
        AFHR_FLPR_YN: "N",
        OFL_YN: "",
        INQR_DVSN: "02",
        UNPR_DVSN: "01",
        FUND_STTL_ICLD_YN: "N",
        FNCG_AMT_AUTO_RDPT_YN: "N",
        PRCS_DVSN: "00",
        CTX_AREA_FK100: "",
        CTX_AREA_NK100: "",
      },
    },
  );

  if (data.rt_cd !== "0") {
    throw new Error(`잔고조회 실패(${data.msg_cd}): ${data.msg1}`);
  }

  const holdings: KisHolding[] = (data.output1 ?? [])
    .filter((row) => toNumber(row.hldg_qty) > 0)
    .map((row) => ({
      ticker: row.pdno,
      name: row.prdt_name,
      quantity: toNumber(row.hldg_qty),
      averagePrice: toNumber(row.pchs_avg_pric),
      currentPrice: toNumber(row.prpr),
      evaluationAmount: toNumber(row.evlu_amt),
      purchaseAmount: toNumber(row.pchs_amt),
      profitLoss: toNumber(row.evlu_pfls_amt),
      profitLossRate: toNumber(row.evlu_pfls_rt),
    }));

  const o2 = data.output2?.[0];
  const summary: KisAccountSummary | null = o2
    ? {
        cashTotal: toNumber(o2.dnca_tot_amt),
        totalEvaluation: toNumber(o2.tot_evlu_amt),
        purchaseTotal: toNumber(o2.pchs_amt_smtl_amt),
        evaluationTotal: toNumber(o2.evlu_amt_smtl_amt),
        profitLoss: toNumber(o2.evlu_pfls_smtl_amt),
        netAsset: toNumber(o2.nass_amt),
        stockEvaluation: toNumber(o2.tot_stck_evlu_amt ?? o2.scts_evlu_amt),
      }
    : null;

  return { summary, holdings, isMock: env.isMock };
};
