import {
	BigNum,
	// PERCENTAGE_PRECISION,
	PERCENTAGE_PRECISION_EXP,
	SpotMarketAccount,
	SpotMarkets,
	calculateDepositRate,
	BN,
	ZERO,
	calculateInterestRate,
} from '@drift-labs/sdk';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { aprFromApy } from '@drift/common';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import useEstimatedLiquidationRatio from './useCurrentLiquidationRatio';
import { useCommonDriftStore } from '@drift-labs/react';
import useCurrentLstMetrics from './useCurrentLstMetrics';
import useAppStore from './useAppStore';

const DEFAULT_VALUE = {
	solBorrowRate: 0,
	lstDepositRate: 0,
	lstApy: 0,
	leveragedBorrowRate: 0,
	leveragedDepositRate: 0,
	leveragedLstApr: 0,
	leveragedEmissionsApr: 0,
	lstNetProjectedApr: 0,
	totalNetProjectedApr: 0,
	solBorrowAmount: 0,
	projectedLiqRatio: 0,
	unleveragedApr: 0,
	loaded: false,
};

/*
 * Returns amount of SOL that will be borrowed to achieve the desired leverage on the active LST
 */
const useEstimateApr = ({
	lstAmount,
	solAmount,
	includeBorrowRateDelta = false,
}: {
	lstAmount: number;
	solAmount: number;
	includeBorrowRateDelta?: boolean;
}) => {
	const driftClient = useCommonDriftStore((s) => s.driftClient?.client);
	const driftClientisReady = useCustomDriftClientIsReady();
	const lstMetrics = useCurrentLstMetrics();
	const activeLst = useAppStore((s) => s.activeLst);
	const driftEnv = useCommonDriftStore((s) => s.env.driftEnv);

	const lstSpotMarket = activeLst.spotMarket;
	const solSpotMarket = (
		SpotMarkets[driftEnv] || SpotMarkets['mainnet-beta']
	).find((market) => market.symbol === 'SOL');

	const projectedLiqRatio = useEstimatedLiquidationRatio({
		lstAmount,
		solAmount,
	});

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
		calculateInterestRate(
			solSpotMarketAccount,
			includeBorrowRateDelta
				? new BN(
						Math.min(solAmount * LAMPORTS_PER_SOL, Number.MAX_SAFE_INTEGER)
				  ).neg()
				: ZERO
		),
		PERCENTAGE_PRECISION_EXP
	);

	const superStakeLstDeposit = lstAmount;
	const initialLstDeposit = lstAmount - solAmount / lstMetrics.priceInSol;
	const solBorrowAmount = solAmount;

	if (isNaN(solBorrowAmount)) return DEFAULT_VALUE;

	const lstAprFromApy =
		aprFromApy(lstMetrics.lstPriceApy30d, Math.floor(365 / 2)) / 100;

	const solInFromStaking =
		superStakeLstDeposit * lstAprFromApy * lstMetrics.priceInSol;
	const solInFromDeposit =
		superStakeLstDeposit * lstDepositRate.toNum() * lstMetrics.priceInSol;
	const leveragedLstApr =
		solInFromStaking / (initialLstDeposit * lstMetrics.priceInSol);
	const solOut = solBorrowAmount * solBorrowRate.toNum();
	const solRewardsPerYear = solInFromStaking + solInFromDeposit - solOut;
	const lstNetProjectedApr =
		solRewardsPerYear / (initialLstDeposit * lstMetrics.priceInSol);
	const leveragedBorrowRate = solOut / (initialLstDeposit * lstMetrics.priceInSol);
	const leveragedDepositRate = solInFromDeposit / (initialLstDeposit * lstMetrics.priceInSol);

	// Add emissions APR on top because they are airdropped separately
	// Not subject to the borrow rate
	const emissionsAprFromApy = lstMetrics.emissionsApy ? 
		aprFromApy(lstMetrics.emissionsApy, Math.floor(365 / 2)) / 100 : 0;
	const solInFromEmissions = superStakeLstDeposit * emissionsAprFromApy;
	const leveragedEmissionsApr = 
	solInFromEmissions / (initialLstDeposit * lstMetrics.priceInSol);

	const totalNetProjectedApr = lstNetProjectedApr + leveragedEmissionsApr;

	return {
		solBorrowRate: solBorrowRate.toNum() * 100,
		lstDepositRate: lstDepositRate.toNum() * 100,
		lstApy: lstMetrics.lstPriceApy30d,

		// independant lst yield apr incl. leverage
		leveragedLstApr: leveragedLstApr * 100,

		// independent emissions apr incl. leverage
		leveragedEmissionsApr: leveragedEmissionsApr * 100,

		// Sol borro ratew denominated in % of user's collateral value in sol
		// Helps to understand the apr breakdown where other values incl. leverage
		leveragedBorrowRate: leveragedBorrowRate * 100,

		// Deposit rate of total LST value in SOL denominated in % of user's collateral value in sol
		leveragedDepositRate: leveragedDepositRate * 100,

		// net apr of borrow rate + lst deposit rate + lst yield incl. leverage
		lstNetProjectedApr: lstNetProjectedApr * 100,

		// total net apr of lstNetProjectedApr and emissions apr together
		totalNetProjectedApr: totalNetProjectedApr * 100,

		solBorrowAmount,
		projectedLiqRatio,
		unleveragedApr: lstDepositRate.toNum() * 100 + lstAprFromApy * 100 + emissionsAprFromApy * 100,
		loaded: true,
	};
};

export default useEstimateApr;
