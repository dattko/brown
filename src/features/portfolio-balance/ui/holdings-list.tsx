"use client";

import { useHoldingsList } from "../model/use-holdings-list";
import { HoldingsListView } from "./holdings-list-view";

export const HoldingsList = () => {
  const vm = useHoldingsList();
  return <HoldingsListView {...vm} />;
};
