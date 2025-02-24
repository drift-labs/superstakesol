import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';
import { singletonHook } from 'react-singleton-hook';
import { DEFAULT_METRICS_POLLING_RATE_MS } from '../constants';

const MSOL_METRICS_ENDPOINT = 'https://api.marinade.finance/msol/apy/7d';

export type MSOL_METRICS_ENDPOINT_RESPONSE = {
	value: number;
	end_price: number;
};

/**
 * Keeps mSol metrics from the marinade API updated in the app store. Only use this once for the app!
 *
 * Unless we turn it into a singleton hook (which I don't even know if that works tbh)
 */
const useSyncMSolMetrics = (
	pollingRateMs = DEFAULT_METRICS_POLLING_RATE_MS
) => {
	const [metrics, setMetrics] = useState<
		Partial<MSOL_METRICS_ENDPOINT_RESPONSE> & { loaded: boolean }
	>({ loaded: false });

	const getAndSetMsolMetrics = async () => {
		const results = await fetch(MSOL_METRICS_ENDPOINT);
		const metrics = (await results.json()) as MSOL_METRICS_ENDPOINT_RESPONSE;

		setMetrics({
			loaded: true,
			...metrics,
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
