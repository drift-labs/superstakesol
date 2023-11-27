// LST (Liquid Staking Tokens)

import { MainnetSpotMarkets, SpotMarketConfig } from '@drift-labs/sdk';

export type LST = {
	symbol: string; // symbol is added as a config because JitoSOL's symbol in the spotMarket is jitoSOL
	driftAccountName: string;
	spotMarket: SpotMarketConfig;
	logoUrl: string;
	// maxLeverage set manually for now, but would be nice if we make it derived from the asset weight later on
	maxLeverage: number;
	// Default leverage to start the form out with when switching to the lst
	defaultLeverage: number;
};

export const M_SOL: LST = {
	symbol: 'mSOL',
	driftAccountName: 'Super Stake SOL',
	spotMarket: MainnetSpotMarkets[2],
	logoUrl: '/mSol.svg',
	maxLeverage: 3,
	defaultLeverage: 2
};

export const JITO_SOL: LST = {
	symbol: 'JitoSOL',
	driftAccountName: 'Super Stake JitoSOL',
	spotMarket: MainnetSpotMarkets[6],
	logoUrl: '/jitoSol.svg',
	maxLeverage: 1.8,
	defaultLeverage: 1.5
};

// export const B_SOL: LST = {
// 	symbol: 'bSOL',
// 	driftAccountName: 'Super Stake bSOL',
// 	spotMarket: MainnetSpotMarkets[8],
// 	logoUrl: '/bSol.svg',
// 	maxLeverage: 1.9,
// 	defaultLeverage: 1.5
// };

export const ALL_LST: LST[] = [M_SOL, JITO_SOL];
