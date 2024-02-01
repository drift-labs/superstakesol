import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';
import { singletonHook } from 'react-singleton-hook';
import { DEFAULT_METRICS_POLLING_RATE_MS } from '../constants';
import { BaseLstMetrics } from '../types/types';
import { getLstYield, getLstSolPrice } from '@drift/common';

/**
 * Keeps mSol metrics from the marinade API updated in the app store. Only use this once for the app!
 *
 * Unless we turn it into a singleton hook (which I don't even know if that works tbh)
 */
const useSyncMSolMetrics = (
	pollingRateMs = DEFAULT_METRICS_POLLING_RATE_MS
) => {
	const [metrics, setMetrics] = useState<BaseLstMetrics & { loaded: boolean }>({
		loaded: false,
	});

	const getAndSetMsolMetrics = async () => {
		const base30DayYield = await getLstYield('msol', 30);
		const priceInSol = await getLstSolPrice('msol');

		setMetrics({
			loaded: true,
			past30DaysApyAvg: base30DayYield.apy,
			past30DaysAprAvg: base30DayYield.apr,
			priceInSol,
		});
	};

	useInterval(() => {
		getAndSetMsolMetrics();
	}, pollingRateMs);

	useEffect(() => {
		getAndSetMsolMetrics();
	}, []);

	return metrics;
};

export default singletonHook({ loaded: false }, useSyncMSolMetrics);
