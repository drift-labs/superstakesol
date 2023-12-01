import { BigNum, SpotBalanceType, SpotMarkets } from '@drift-labs/sdk';
import useAppStore from './useAppStore';
import useSpotBalanceForMarket from './useSpotBalanceForMarket';
import { matchEnum } from '@drift/common';
import { useCommonDriftStore } from '@drift-labs/react';
import useCurrentLstMetrics from './useCurrentLstMetrics';

const useCurrentSuperstakePosition = () => {
	const driftEnv = useCommonDriftStore((s) => s.env.driftEnv);
	const activeLst = useAppStore((s) => s.activeLst);

	const lsSpotMarket = activeLst.spotMarket;
	const solSpotMarket = (
		SpotMarkets[driftEnv] || SpotMarkets['mainnet-beta']
	).find((market) => market.symbol === 'SOL');

	const lstMetrics = useCurrentLstMetrics();

	const solSpotBalance = useSpotBalanceForMarket(solSpotMarket?.marketIndex);
	const lstSpotBalance = useSpotBalanceForMarket(lsSpotMarket?.marketIndex);
	const lstSpotBalanceBigNum = BigNum.from(
		lstSpotBalance.tokenAmount,
		lsSpotMarket?.precisionExp
	);
	const solSpotBalanceBigNum = BigNum.from(
		solSpotBalance.tokenAmount,
		solSpotMarket?.precisionExp
	);

	const hasLstDeposits =
		matchEnum(lstSpotBalance.balanceType, SpotBalanceType.DEPOSIT) &&
		lstSpotBalanceBigNum.gtZero();

	// User has an "open position" in superstaking if they have a non-zero LST deposit and a non-zero SOL borrow open
	// Does not account for edge cases where the user has modified their position through the Drift UI (for examople, also borrowing USDC to add to their T position, etc.)
	const hasOpenPosition: boolean =
		matchEnum(solSpotBalance.balanceType, SpotBalanceType.BORROW) &&
		solSpotBalanceBigNum.ltZero() &&
		hasLstDeposits;

	// Amount of LST user actually owns if they repay borrow (approximate)
	// Can't determine this unless we know the ratio of LST to SOL which is why there's a "loaded"
	// Sort of an approximation because it doesn't account for swap slippage
	const userLstEquity = {
		loaded: lstMetrics.loaded && solSpotBalance.loaded && lstSpotBalance.loaded,
		value: !lstMetrics.loaded
			? 0
			: lstSpotBalanceBigNum.toNum() -
			  (Math.min(solSpotBalanceBigNum.toNum(), 0) * -1) /
					lstMetrics.priceInSol,
	};

	const userLstLeverage =
		userLstEquity.loaded && hasOpenPosition
			? lstSpotBalanceBigNum.toNum() / userLstEquity.value
			: hasLstDeposits
			? 1
			: 0;

	return {
		hasOpenPosition,
		userLstEquity: userLstEquity,
		userLstLeverage: userLstLeverage,
		userLstDeposits: lstSpotBalanceBigNum,
		userSolDeposits: solSpotBalanceBigNum.isNeg()
			? BigNum.zero(lsSpotMarket?.precisionExp)
			: solSpotBalanceBigNum,
		userSolBorrows: solSpotBalanceBigNum.isNeg()
			? solSpotBalanceBigNum
			: BigNum.zero(solSpotMarket?.precisionExp),
		loaded: solSpotBalance.loaded && lstSpotBalance.loaded,
	};
};

export default useCurrentSuperstakePosition;
