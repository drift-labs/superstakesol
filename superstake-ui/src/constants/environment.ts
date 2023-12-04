import { DriftEnv } from '@drift-labs/sdk';
import {
	EnvironmentConstants,
	Initialize as InitializeCommon,
} from '@drift/common';
import { ALL_LST, ALL_LST_MAP, LST } from './lst';

const driftEnv =
	process.env.NEXT_PUBLIC_DRIFT_ENV === 'mainnet-beta'
		? 'mainnet-beta'
		: ('devnet' as DriftEnv);

InitializeCommon(driftEnv);

type EnvironmentVariables = {


		driftEnv: DriftEnv;
	nextEnv: string | undefined;
	isDev: boolean | undefined;
	basePollingRateMs: number;
	rpcOverride: string | undefined;
	historyServerUrl: string;
	defaultActiveLst: LST;
};

const Env: EnvironmentVariables = {
	driftEnv,
	nextEnv: process.env.NEXT_PUBLIC_ENV,
	isDev:
		!process.env.NEXT_PUBLIC_ENV ||
		['local', 'master', 'devnet'].includes(process.env.NEXT_PUBLIC_ENV),
	basePollingRateMs: process.env.NEXT_PUBLIC_BASE_POLLING_RATE_MS
		? Number(process.env.NEXT_PUBLIC_BASE_POLLING_RATE_MS)
		: 1000,
	rpcOverride: process.env.NEXT_PUBLIC_RPC_OVERRIDE,
	historyServerUrl:
		process.env.NEXT_PUBLIC_DRIFT_ENV === 'mainnet-beta'
			? EnvironmentConstants.historyServerUrl.mainnet
			: EnvironmentConstants.historyServerUrl.dev,
	defaultActiveLst: ALL_LST_MAP[process.env.NEXT_PUBLIC_DEFAULT_ACTIVE_LST] || ALL_LST[0]
};

export default Env;
