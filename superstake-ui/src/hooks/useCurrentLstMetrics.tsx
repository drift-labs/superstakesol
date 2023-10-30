import { JITO_SOL, M_SOL } from "../constants/lst";
import useAppStore from "./useAppStore";
import useSyncMSolMetrics from "./useSyncMSolMetrics";
import { useMemo } from "react";
import useJitoSolMetrics from "./useJitoSolMetrics";

export default function useCurrentLstMetrics(): {
  priceInSol: number;
  loaded: boolean;
  lstPriceApy30d: number;
} {
  const activeLst = useAppStore((s) => s.activeLst);

  const mSolMetrics = useSyncMSolMetrics();
  const jitoSolMetrics = useJitoSolMetrics();

  const getCurrentLstMetrics = () => {
    switch (activeLst) {
      case M_SOL.symbol:
      default:
        return {
          lstPriceApy30d: mSolMetrics.msol_price_apy_30d ?? 0,
          priceInSol: mSolMetrics.m_sol_price ?? 0,
          loaded: mSolMetrics.loaded,
        };
      case JITO_SOL.symbol:
        return {
          lstPriceApy30d: jitoSolMetrics.past30DaysApyAvg ?? 0,
          priceInSol: jitoSolMetrics.priceInSol ?? 0,
          loaded: jitoSolMetrics.loaded,
        };
    }
  };

  const currentLstMetrics = useMemo(
    () => getCurrentLstMetrics(),
    [activeLst, mSolMetrics]
  );

  return currentLstMetrics;
}
