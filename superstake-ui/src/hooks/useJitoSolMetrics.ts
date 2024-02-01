import { DEFAULT_METRICS_POLLING_RATE_MS } from '../constants';
import { getLstSolPrice, getLstYield } from '@drift/common';
import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { useInterval } from 'react-use';
import { BaseLstMetrics } from '../types/types';

function useJitoSolMetrics(pollingRateMs = DEFAULT_METRICS_POLLING_RATE_MS) {
	const [metrics, setMetrics] = useState<
		BaseLstMetrics & {
			loaded: boolean;
		}
	>({ loaded: false });

	useEffect(() => {
		fetchAndSetJitoSolMetrics();
	}, []);

	useInterval(() => {
		fetchAndSetJitoSolMetrics();
	}, pollingRateMs);

	async function fetchAndSetJitoSolMetrics() {
		try {
			const base30DayYield = await getLstYield('jitosol', 30);
			const priceInSol = await getLstSolPrice('jitosol');

			setMetrics({
				loaded: true,
				past30DaysApyAvg: base30DayYield.apy,
				past30DaysAprAvg: base30DayYield.apr,
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
