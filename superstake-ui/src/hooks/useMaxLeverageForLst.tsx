import { useCommonDriftStore, useDriftClientIsReady } from '@drift-labs/react';
import { LST } from '../constants/lst';
import { SOL_SPOT_MARKET_INDEX } from '../utils/uiUtils';
import {
	BigNum,
	QUOTE_PRECISION_EXP,
	SPOT_MARKET_WEIGHT_PRECISION,
	calculateScaledInitialAssetWeight,
} from '@drift-labs/sdk';

const useMaxLeverageForLst = (lst: LST) => {
	const driftClientIsReady = useDriftClientIsReady();
	const driftClient = useCommonDriftStore((s) => s.driftClient);

	const lstSpotMarket = lst.spotMarket;

	if (!driftClient || !driftClientIsReady) {
		return {
			maxLeverage: 1,
			loaded: false,
		};
	}

	const lstSpotMarketAccount = driftClient.client.getSpotMarketAccount(
		lstSpotMarket.marketIndex
	);
	const solSpotMarketAccount = driftClient.client.getSpotMarketAccount(
		SOL_SPOT_MARKET_INDEX
	);

	const spotWeightPrecisionExp =
		SPOT_MARKET_WEIGHT_PRECISION.toString().length - 1;

	const lstOraclePriceData = driftClient.client.getOracleDataForSpotMarket(
		lstSpotMarket.marketIndex
	);
	const lstOraclePriceBigNum = BigNum.from(
		lstOraclePriceData.price,
		QUOTE_PRECISION_EXP
	);

	const lstInitialAssetWeight = BigNum.from(
		calculateScaledInitialAssetWeight(
			lstSpotMarketAccount,
			lstOraclePriceBigNum.val
		),
		spotWeightPrecisionExp
	).toNum();

	const solInitialLiabilityWeight = BigNum.from(
		solSpotMarketAccount.initialLiabilityWeight,
		spotWeightPrecisionExp
	).toNum();

	// make sure to under estimate
	const unroundedMaxLeverage =
		lstInitialAssetWeight /
			(solInitialLiabilityWeight - lstInitialAssetWeight) +
		1;

	const maxLeverage =
		Math.floor(10 * Math.min(3, Math.max(1, unroundedMaxLeverage))) / 10;

	return {
		maxLeverage,
		loaded: true,
	};
};

export default useMaxLeverageForLst;
