import { useMemo } from 'react';
import useAppStore from './useAppStore';
import {
	BN,
	SpotBalanceType,
	SpotMarketAccount,
	getTokenAmount,
	getSignedTokenAmount,
} from '@drift-labs/sdk';
import { matchEnum } from '@drift/common';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { useCommonDriftStore } from '@drift-labs/react';

const DEFAULT_RETURN_VALUE = {
	balanceType: SpotBalanceType.DEPOSIT,
	tokenAmount: new BN(0),
	cumulativeDeposits: new BN(0),
	loaded: false,
};

/**
 * Book to return memoized spot balances
 */
const useSpotBalanceForMarket = (marketIndex: number | undefined) => {
	const driftClientIsReady = useCustomDriftClientIsReady();
	const driftClient = useCommonDriftStore((s) => s.driftClient.client);
	const spotPositionForMarket = useAppStore((s) =>
		s.currentUserAccount.spotPositions.find(
			(position) => position.marketIndex === marketIndex
		)
	);
	const { depositRecords, swapRecords, loaded } = useAppStore(
		(s) => s.eventRecords
	);

	const scaledBalanceString = spotPositionForMarket?.scaledBalance?.toString();
	const cumulativeDepositsString =
		spotPositionForMarket?.cumulativeDeposits?.toString();
	const isBorrow = matchEnum(
		spotPositionForMarket?.balanceType,
		SpotBalanceType.BORROW
	);

	const balance = useMemo(() => {
		if (!spotPositionForMarket || !driftClientIsReady) {
			return DEFAULT_RETURN_VALUE;
		}

		let marketAccount;

		try {
			marketAccount = driftClient?.getSpotMarketAccount(
				marketIndex as number
			) as SpotMarketAccount;
		} catch (e) {
			return DEFAULT_RETURN_VALUE;
		}

		return {
			balanceType: spotPositionForMarket?.balanceType,
			tokenAmount: getSignedTokenAmount(
				getTokenAmount(
					spotPositionForMarket?.scaledBalance,
					marketAccount,
					spotPositionForMarket.balanceType
				),
				spotPositionForMarket.balanceType
			),
			cumulativeDeposits: spotPositionForMarket?.cumulativeDeposits,
			loaded: loaded,
		};
	}, [
		driftClient,
		driftClientIsReady,
		scaledBalanceString,
		cumulativeDepositsString,
		isBorrow,
		depositRecords?.length,
		swapRecords?.length,
		loaded,
		spotPositionForMarket
	]);

	return balance;
};

export default useSpotBalanceForMarket;
