"use client";

import { usePortfolioSummary } from "./model/use-portfolio-summary";
import { PortfolioSummaryView } from "./ui/portfolio-summary-view";

export const PortfolioSummary = () => {
  const vm = usePortfolioSummary();
  return <PortfolioSummaryView {...vm} />;
};
