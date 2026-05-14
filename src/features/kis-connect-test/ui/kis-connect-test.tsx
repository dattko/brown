"use client";

import { useKisConnectTest } from "../model/use-kis-connect-test";
import { KisConnectTestView } from "./kis-connect-test-view";

export const KisConnectTest = () => {
  const vm = useKisConnectTest();
  return <KisConnectTestView {...vm} />;
};
