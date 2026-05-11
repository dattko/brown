import { HoldingsList } from "@/widgets/holdings-list/holdings-list";
import { PortfolioSummary } from "@/widgets/portfolio-summary/portfolio-summary";
import { RankingBoard } from "@/widgets/ranking-board/ranking-board";

const Home = () => (
  <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:py-14">
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Brown</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        KIS 모의투자 잔고와 실전 시장 순위를 한 화면에서 봅니다.
      </p>
    </header>

    <section className="space-y-6">
      <PortfolioSummary />
      <HoldingsList />
    </section>

    <RankingBoard />
  </main>
);

export default Home;
