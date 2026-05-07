/** 보유 종목 한 줄 (도메인 모델) */
export type KisHolding = {
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  evaluationAmount: number;
  purchaseAmount: number;
  profitLoss: number;
  profitLossRate: number;
};

/** 계좌 요약 */
export type KisAccountSummary = {
  /** 예수금총금액 */
  cashTotal: number;
  /** 총평가금액(예수금 + 주식 평가) */
  totalEvaluation: number;
  /** 매입금액 합계 */
  purchaseTotal: number;
  /** 평가금액 합계(주식만) */
  evaluationTotal: number;
  /** 평가손익 합계 */
  profitLoss: number;
  /** 순자산 금액 */
  netAsset: number;
  /** 주식 평가금액(유가증권 평가 포함) */
  stockEvaluation: number;
};

export type KisBalance = {
  summary: KisAccountSummary | null;
  holdings: KisHolding[];
  /** 모의투자 여부 */
  isMock: boolean;
};
