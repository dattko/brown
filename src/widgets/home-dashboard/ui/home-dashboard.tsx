import { RankingBoard } from "@/features/market-ranking";
import { HoldingsList, PortfolioSummary } from "@/features/portfolio-balance";
import { StockSearchBar } from "@/features/stock-search";

/**
 * 메인 대시보드: 여러 `features`를 한 화면 레이아웃으로 묶습니다.
 * 새 페이지용 위젯은 `src/widgets/<이름>/` 에 같은 방식으로 추가하면 됩니다.
 */
export const HomeDashboard = () => (
  <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:py-14">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight">Brown</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          KIS 모의투자 잔고와 실전 시장 순위를 한 화면에서 봅니다.
        </p>
      </div>
      <StockSearchBar compact className="w-full shrink-0 sm:w-auto sm:max-w-xs" />
    </header>

    <section className="space-y-6">
      <PortfolioSummary />
      <HoldingsList />
    </section>

    <RankingBoard />
  </main>
);
