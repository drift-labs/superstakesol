import { DEFAULT_METRICS_POLLING_RATE_MS } from "../constants";
import { B_SOL, JITO_SOL } from "../constants/lst";
import { BSOL_STATS_API_RESPONSE, fetchBSolDriftEmissions, fetchBSolMetrics } from "@drift-labs/sdk";
import { useEffect, useState } from "react";
import { singletonHook } from "react-singleton-hook";
import { useInterval } from "react-use";
import useAppStore from "./useAppStore";

function useBSolMetrics(pollingRateMs = DEFAULT_METRICS_POLLING_RATE_MS) {
	const activeLst = useAppStore(s => s.activeLst);
	
	const [metrics, setMetrics] = useState<{
		loaded: boolean;
		baseApy?: number;
		blzeApy?: number;
		// Lending bSOL (i.e. deposits on drift) earns 1.5x the base blze apy
		lendingMultiplier?: number;
		driftEmissions?: number;
		priceInSol?: number;
	}>({ loaded: false });
	
	useEffect(() => {
		fetchAndSetBSolMetrics();
	}, []);
	
	useInterval(() => {
		fetchAndSetBSolMetrics();
	}, pollingRateMs);
	
	async function fetchAndSetBSolMetrics() {
		console.log('fetchAndSetBSolMetrics', activeLst.symbol);
		
		if (activeLst.symbol !== B_SOL.symbol) return;
		
		try {
			let baseApy: number;
			let blzeApy: number;
			let lendingMultiplier: number;
			let priceInSol: number;
			let driftEmissions: number;

			const statsResponse = await fetchBSolMetrics();			
			if (statsResponse.status === 200) {
				const data = await statsResponse.json() as BSOL_STATS_API_RESPONSE;
				priceInSol = data?.stats?.conversion?.bsol_to_sol;
				baseApy = data?.stats?.apy.base;
				lendingMultiplier = data?.stats?.apy.lending;
				blzeApy = data?.stats?.apy.blze * lendingMultiplier;
			}

			const driftEmissionsResponse = await fetchBSolDriftEmissions();
			if (driftEmissionsResponse.status === 200) {
				const data = await driftEmissionsResponse.json();
				driftEmissions = data?.emissions?.lend;
			}
			
			console.log('bsol metrics', {
				priceInSol,
				driftEmissions,
				baseApy,
				blzeApy,
				lendingMultiplier,
			});
			
			setMetrics({
				loaded: true,
				baseApy,
				blzeApy,
				driftEmissions,
				priceInSol,
			});
		} catch (e) {
			console.error(e);
			setMetrics({ loaded: false });
		}
	}
	
	return metrics;
}

export default singletonHook({ loaded: false }, useBSolMetrics);
