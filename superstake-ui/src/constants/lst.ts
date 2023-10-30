// LST (Liquid Staking Tokens)

import { MainnetSpotMarkets, SpotMarketConfig } from '@drift-labs/sdk';

export type LST = {
	symbol: string; // symbol is added as a config because JitoSOL's symbol in the spotMarket is jitoSOL
	driftAccountName: string;
	spotMarket: SpotMarketConfig;
	logoUrl: string;
};

export const M_SOL: LST = {
	symbol: 'mSOL',
	driftAccountName: 'Super Stake SOL',
	spotMarket: MainnetSpotMarkets[2],
	logoUrl: '/mSol.svg',
};

export const JITO_SOL: LST = {
	symbol: 'JitoSOL',
	driftAccountName: 'Super Stake JitoSOL',
	spotMarket: MainnetSpotMarkets[6],
	logoUrl: '/jitoSol.svg',
};

export const ALL_LST: LST[] = [M_SOL, JITO_SOL];
