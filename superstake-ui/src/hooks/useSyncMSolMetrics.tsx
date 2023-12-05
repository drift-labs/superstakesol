import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';
import { singletonHook } from 'react-singleton-hook';
import { DEFAULT_METRICS_POLLING_RATE_MS } from '../constants';

const MSOL_METRICS_ENDPOINT = 'https://api2.marinade.finance/metrics_json';

export type MSOL_METRICS_ENDPOINT_RESPONSE = {
	total_active_balance: number;
	available_reserve_balance: number;
	emergency_cooling_down: number;
	tvl_sol: number;
	msol_directed_stake_sol: number;
	msol_directed_stake_msol: number;
	mnde_total_supply: number;
	mnde_circulating_supply: number;
	validators_count: number;
	stake_accounts: number;
	staking_sol_cap: number;
	m_sol_price: number;
	avg_staking_apy: number;
	msol_price_apy_14d: number;
	msol_price_apy_30d: number;
	msol_price_apy_90d: number;
	msol_price_apy_365d: number;
	reserve_pda: number;
	treasury_m_sol_amount: number;
	m_sol_mint_supply: number;
	m_sol_supply_state: number;
	liq_pool_sol: number;
	liq_pool_m_sol: number;
	liq_pool_value: number;
	liq_pool_token_supply: number;
	liq_pool_token_price: number;
	liq_pool_target: number;
	liq_pool_min_fee: number;
	liq_pool_max_fee: number;
	liq_pool_current_fee: number;
	liq_pool_treasury_cut: number;
	liq_pool_cap: number;
	total_cooling_down: number;
	last_stake_delta_epoch: number;
	circulating_ticket_count: number;
	circulating_ticket_balance: number;
	reward_fee_bp: number;
	lido_staking: number;
	lido_st_sol_price: number;
	lido_stsol_price_apy_14d: number;
	lido_stsol_price_apy_30d: number;
	lido_stsol_price_apy_90d: number;
	lido_stsol_price_apy_365d: number;
	stake_delta: number;
	bot_balance: number;
	treasury_farm_claim_mnde_balance: number;
	last_3_epochs_avg_duration_hs: number;
	mnde_votes_validators: number;
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
