import { DEFAULT_METRICS_POLLING_RATE_MS } from '../constants';
import { JITO_SOL } from '../constants/lst';
import { fetchJitoSolMetrics } from '@drift-labs/sdk';
import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { useInterval } from 'react-use';

function useJitoSolMetrics(pollingRateMs = DEFAULT_METRICS_POLLING_RATE_MS) {
	const [metrics, setMetrics] = useState<{
		loaded: boolean;
		past30DaysApyAvg?: number;
		priceInSol?: number;
	}>({ loaded: false });

	useEffect(() => {
		fetchAndSetJitoSolMetrics();
	}, []);

	useInterval(() => {
		fetchAndSetJitoSolMetrics();
	}, pollingRateMs);

	async function fetchAndSetJitoSolMetrics() {
		try {
			const data = await fetchJitoSolMetrics();

			const past30DaysApyAvg =
				(data.data.getStakePoolStats.apy
					.slice(-30)
					.reduce((a, b) => a + b.data, 0) /
					30) *
				100;

			const priceInSol =
				data.data.getStakePoolStats.tvl.slice(-1)[0].data /
				JITO_SOL.spotMarket.precision.toNumber() /
				data.data.getStakePoolStats.supply.slice(-1)[0].data;

			setMetrics({
				loaded: true,
				past30DaysApyAvg,
				priceInSol,
			});
		} catch (e) {
			console.error(e);
			setMetrics({ loaded: false });
		}
	}

	return metrics;
}

export default singletonHook({ loaded: false }, useJitoSolMetrics);
