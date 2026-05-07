import { HoldingsList } from "@/widgets/holdings-list/holdings-list";
import { PortfolioSummary } from "@/widgets/portfolio-summary/portfolio-summary";

const Home = () => (
  <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:py-14">
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Brown</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        한국투자증권(KIS) 모의투자 계좌의 잔고와 보유 종목을 한 화면에서 봅니다.
      </p>
    </header>
    <PortfolioSummary />
    <HoldingsList />
  </main>
);

export default Home;
