import {
	BN,
	JupiterClient,
	QuoteResponse,
	SpotMarketConfig,
	ZERO,
} from '@drift-labs/sdk';

const SWAP_PAIRS_WITH_MAX_ACCOUNTS_LIMIT = [
	{ pair: ['mSOL', 'jitoSOL'], maxAccounts: 46 },
	{ pair: ['SOL', 'jitoSOL'], maxAccounts: 50 },
];

export const getSwapQuote = async ({
	swapAmount,
	swapFromMarket,
	swapToMarket,
	jupiterClient,
	swapMode,
	slippageBps,
}: {
	swapAmount: BN;
	swapFromMarket: SpotMarketConfig;
	swapToMarket: SpotMarketConfig;
	jupiterClient: JupiterClient;
	swapMode: 'ExactIn' | 'ExactOut';
	slippageBps: number;
}) => {
	let jupiterSwapQuote: QuoteResponse;

	try {
		if (swapAmount.gt(ZERO)) {
			const maxAccounts = SWAP_PAIRS_WITH_MAX_ACCOUNTS_LIMIT.find(
				(pair) =>
					(pair.pair[0] === swapFromMarket.symbol &&
						pair.pair[1] === swapToMarket.symbol) ||
					(pair.pair[1] === swapFromMarket.symbol &&
						pair.pair[0] === swapToMarket.symbol)
			)?.maxAccounts;

			const quote = await jupiterClient.getQuote({
				inputMint: swapFromMarket.mint,
				outputMint: swapToMarket.mint,
				amount: swapAmount,
				slippageBps,
				swapMode,
				maxAccounts,
				excludeDexes: ['Raydium CLMM'], // temp exclude to workaround bug with raydium clmm
			});

			jupiterSwapQuote = quote;
		}
	} catch (err) {
		console.error('Error fetching jupiter routes', err);
	}

	return jupiterSwapQuote;
};
