"use client";

import { usePortfolioSummary } from "../model/use-portfolio-summary";
import { PortfolioSummaryView } from "./portfolio-summary-view";

export const PortfolioSummary = () => {
  const vm = usePortfolioSummary();
  return <PortfolioSummaryView {...vm} />;
};
