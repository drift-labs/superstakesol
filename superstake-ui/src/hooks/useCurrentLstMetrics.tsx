import { B_SOL, JITO_SOL, M_SOL } from "../constants/lst";
import useAppStore from "./useAppStore";
import useSyncMSolMetrics from "./useSyncMSolMetrics";
import { useMemo } from "react";
import useJitoSolMetrics from "./useJitoSolMetrics";
import useBSolMetrics from "./useBSolMetrics";

export default function useCurrentLstMetrics(): {
  priceInSol: number;
  loaded: boolean;
  // Base APY of the LST
  lstPriceApy30d: number;
  // Extra emissions APY (most likely airdropped to users separately)
  emissionsApy?: number;
  // Extra promotional emissions that may be available as a temporary reward but do not have an APY
  driftEmissions?: number;
} {
  const activeLst = useAppStore((s) => s.activeLst);

  const mSolMetrics = useSyncMSolMetrics();
  const jitoSolMetrics = useJitoSolMetrics();
  const bSolMetrics = useBSolMetrics();

  switch (activeLst.symbol) {
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
    case B_SOL.symbol:
      return {
        lstPriceApy30d: (bSolMetrics.baseApy ?? 0),
        priceInSol: bSolMetrics.priceInSol ?? 0,
        loaded: bSolMetrics.loaded,
        emissionsApy: bSolMetrics.blzeApy,
        driftEmissions: bSolMetrics.driftEmissions
      };
  }
}
