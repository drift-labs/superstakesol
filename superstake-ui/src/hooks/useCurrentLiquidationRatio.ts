import {
	SpotMarketAccount,
	SpotMarkets,
	BN,
	calculateEstimatedSuperStakeLiquidationPrice,
	calculateSizeDiscountAssetWeight,
	convertToNumber,
	calculateSizePremiumLiabilityWeight,
	SPOT_MARKET_WEIGHT_PRECISION,
	BigNum,
} from '@drift-labs/sdk';
import { SOL_PRECISION_EXP } from '../utils/uiUtils';
import { useCommonDriftStore, useDriftClientIsReady } from '@drift-labs/react';
import useCurrentLstMetrics from './useCurrentLstMetrics';
import useAppStore from './useAppStore';

/*
 * Returns current liquidation ratio at given LST / sol balances
 */
const useEstimatedLiquidationRatio = ({
	lstAmount,
	solAmount,
}: {
	lstAmount: number;
	solAmount: number;
}) => {
	const driftClient = useCommonDriftStore((s) => s.driftClient?.client);
	const driftClientisReady = useDriftClientIsReady();
	const lstMetrics = useCurrentLstMetrics();

	const driftEnv = useCommonDriftStore((s) => s.env.driftEnv);
	const activeLst = useAppStore((s) => s.activeLst);

	const lstSpotMarket = activeLst.spotMarket;
	const solSpotMarket = (
		SpotMarkets[driftEnv] || SpotMarkets['mainnet-beta']
	).find((market) => market.symbol === 'SOL');

	if (
		!lstMetrics.loaded ||
		!driftClient ||
		!driftClientisReady ||
		!lstSpotMarket ||
		!solSpotMarket
	)
		return 0;

	let lstSpotMarketAccount: SpotMarketAccount | undefined,
		solSpotMarketAccount: SpotMarketAccount | undefined;
	try {
		lstSpotMarketAccount = driftClient.getSpotMarketAccount(
			lstSpotMarket.marketIndex
		);
		solSpotMarketAccount = driftClient.getSpotMarketAccount(
			solSpotMarket.marketIndex
		);
	} catch (err) {
		console.log(err);
	}

	if (!lstSpotMarketAccount || !solSpotMarketAccount) {
		return 0;
	}

	if (
		isNaN(solAmount) ||
		isNaN(lstAmount) ||
		`${lstAmount}${solAmount}`.includes('e-')
	)
		return 0;

	const lstAmountBigNum = BigNum.fromPrint(
		`${lstAmount}`,
		activeLst.spotMarket.precisionExp
	);
	const solAmountBigNum = BigNum.fromPrint(`${solAmount}`, SOL_PRECISION_EXP);

	const maintenanceWeight = calculateSizeDiscountAssetWeight(
		lstAmountBigNum.val,
		new BN(lstSpotMarketAccount.imfFactor),
		new BN(lstSpotMarketAccount.maintenanceAssetWeight)
	);

	const liabilityWeight = calculateSizePremiumLiabilityWeight(
		solAmountBigNum.val,
		new BN(solSpotMarketAccount.imfFactor),
		new BN(solSpotMarketAccount.maintenanceLiabilityWeight),
		SPOT_MARKET_WEIGHT_PRECISION
	);

	const projectedLiqRatio = calculateEstimatedSuperStakeLiquidationPrice(
		lstAmount,
		convertToNumber(maintenanceWeight, SPOT_MARKET_WEIGHT_PRECISION),
		solAmount,
		convertToNumber(liabilityWeight, SPOT_MARKET_WEIGHT_PRECISION),
		lstMetrics.priceInSol
	);

	return projectedLiqRatio;
};

export default useEstimatedLiquidationRatio;
