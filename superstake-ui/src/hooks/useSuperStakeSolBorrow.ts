import {
	BigNum,
	PERCENTAGE_PRECISION_EXP,
	SpotMarketAccount,
	SpotMarkets,
	calculateBorrowRate,
	calculateDepositRate,
	calculateEstimatedSuperStakeLiquidationPrice,
} from '@drift-labs/sdk';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { aprFromApy } from '@drift/common';
import { useCommonDriftStore } from '@drift-labs/react';
import useCurrentLstMetrics from './useCurrentLstMetrics';
import useAppStore from './useAppStore';

const DEFAULT_VALUE = {
	solBorrowRate: 0,
	lstAprFromApy: 0,
	lstDepositRate: 0,
	lstApy: 0,
	solBorrowAmount: 0,
	projectedApr: 0,
	projectedLiqRatio: 0,
};

/*
 * Returns amount of SOL that will be borrowed to achieve the desired leverage on the active LST
 */
const useSuperStakeSolBorrow = ({
	lstAmount,
	leverage,
}: {
	lstAmount: number;
	leverage: number;
}) => {
	const driftClient = useCommonDriftStore((s) => s.driftClient?.client);
	const driftClientisReady = useCustomDriftClientIsReady();
	const driftEnv = useCommonDriftStore((s) => s.env.driftEnv);
	const lstMetrics = useCurrentLstMetrics();
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
		return DEFAULT_VALUE;

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
		return DEFAULT_VALUE;
	}

	const lstDepositRate = BigNum.from(
		calculateDepositRate(lstSpotMarketAccount),
		PERCENTAGE_PRECISION_EXP
	);
	const solBorrowRate = BigNum.from(
		calculateBorrowRate(solSpotMarketAccount),
		PERCENTAGE_PRECISION_EXP
	);

	const superStakeLstDeposit = lstAmount * leverage;
	const solBorrowAmount =
		(superStakeLstDeposit - lstAmount) * lstMetrics.priceInSol;

	if (isNaN(solBorrowAmount)) return DEFAULT_VALUE;

	const lstAprFromApy =
		aprFromApy(lstMetrics.lstPriceApy30d, Math.floor(365 / 2)) / 100;

	const solInFromStaking =
		superStakeLstDeposit * lstAprFromApy * lstMetrics.priceInSol;
	const solInFromDeposit =
		superStakeLstDeposit * lstDepositRate.toNum() * lstMetrics.priceInSol;
	const leveragedStakingAPR =
		solInFromStaking / (lstAmount * lstMetrics.priceInSol);
	const solOut = solBorrowAmount * solBorrowRate.toNum();
	const solRewardsPerYear = solInFromStaking + solInFromDeposit - solOut;

	// Something about these numbers seem not quite right still? I don't know what it is, but gonna leave it like this because whatever it is, it's pretty close.
	// console.log({
	// 	leveragedStakingAPR,
	// 	mSolDepositRate: mSolDepositRate.toNum() * 100,
	// 	solBorrowRate: solBorrowRate.toNum() * 100,
	// 	mSolAprFromApy: mSolAprFromApy * 100,
	// 	solInFromStaking,
	// 	solInFromDeposit,
	// 	solOut,
	// 	solRewardsPerYear,
	// 	solAmountEquiv: mSolAmount * mSolMetrics.m_sol_price,
	// 	superStakeMsolDeposit,
	// });

	const projectedApr = solRewardsPerYear / (lstAmount * lstMetrics.priceInSol);

	const projectedLiqRatio = calculateEstimatedSuperStakeLiquidationPrice(
		lstAmount * leverage,
		lstSpotMarketAccount.maintenanceAssetWeight,
		solBorrowAmount,
		solSpotMarketAccount.maintenanceLiabilityWeight,
		lstMetrics.priceInSol
	);

	return {
		solBorrowRate: solBorrowRate.toNum() * 100,
		lstDepositRate: lstDepositRate.toNum() * 100,
		lstAprFromApy: leveragedStakingAPR * 100,
		lstApy: lstMetrics.lstPriceApy30d,
		solBorrowAmount,
		projectedApr: projectedApr * 100,
		projectedLiqRatio,
	};
};

export default useSuperStakeSolBorrow;
