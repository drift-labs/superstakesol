import { useCommonDriftStore, useWallet } from '@drift-labs/react';
import { calculateSuperStakeMaxLeverage } from '../../../drift-common/protocol/sdk/lib';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { LST } from '../constants/lst';
import { SOL_SPOT_MARKET_INDEX } from '../utils/uiUtils';
import useSPLTokenBalance from './useSPLTokenBalance';
import { BASE_PRECISION_EXP } from '@drift-labs/sdk';
import { BigNum } from '@drift-labs/sdk';

const useMaxLeverageForLst = (lst: LST) => {
	const driftClientIsReady = useCustomDriftClientIsReady();
	const driftClient = useCommonDriftStore((s) => s.driftClient);
	const connected = useWallet().connected;

	const lstSpotMarket = lst.spotMarket;
	const precision = lstSpotMarket?.precisionExp || BASE_PRECISION_EXP;
	const lstBalance = useSPLTokenBalance(
		lstSpotMarket?.mint?.toString() || '',
		precision
	);

	if (!driftClient || !driftClientIsReady) {
		return 1;
	}

	if (
		!connected ||
		!lstBalance.balanceLoaded ||
		(lstBalance.balanceLoaded && lstBalance.balanceBigNum.eqZero())
	) {
		// Hypothetical balance of 100 to match the left panel max leverage value if wallet balance is 0 or unavailable
		lstBalance.balance = 100;
		lstBalance.balanceBigNum = BigNum.fromPrint('100', precision);
		lstBalance.balanceLoaded = true;
		lstBalance.tokenAccountAddress = '';
	}

	const { weightedDepositValue, maxBorrowValue, maxLeverage } =
		calculateSuperStakeMaxLeverage(
			driftClient.client,
			SOL_SPOT_MARKET_INDEX,
			lstSpotMarket.marketIndex,
			lstBalance.balanceBigNum.val
		);

	console.log({
		weightedDepositValue: weightedDepositValue.toNumber(),
		maxBorrowValue: maxBorrowValue.toNumber(),
		maxLeverage,
	});

	return parseFloat(maxLeverage.toFixed(1));
};

export default useMaxLeverageForLst;
