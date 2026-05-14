import { create } from "zustand";

/** 순위 보드 탭 value (TabsTrigger value와 동일) */
export type RankingUiTab = "amount" | "volume" | "rise" | "fall";

export type RankingUiStoreState = {
  activeTab: RankingUiTab;
  setActiveTab: (tab: RankingUiTab) => void;
  /** WebSocket 브리지 연결 여부 — true면 순위 REST 폴링 중지 */
  wsConnected: boolean;
  setWsConnected: (v: boolean) => void;
};

export const useRankingUiStore = create<RankingUiStoreState>((set) => ({
  activeTab: "amount",
  setActiveTab: (activeTab) => set({ activeTab }),
  wsConnected: false,
  setWsConnected: (wsConnected) => set({ wsConnected }),
}));
