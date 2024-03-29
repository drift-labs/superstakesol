import { LST, ALL_LST } from '../constants/lst';
import { useCommonDriftStore, useDriftClientIsReady } from '@drift-labs/react';
import { BigNum, SpotBalanceType, decodeName } from '@drift-labs/sdk';
import { matchEnum } from '@drift/common';
import { useEffect, useRef, useState } from 'react';
import Env from '../constants/environment';

export default function useFirstLstWithPosition() {
	const commonStore = useCommonDriftStore();
	const driftClient = useCommonDriftStore((s) => s.driftClient.client);
	const driftClientIsReady = useDriftClientIsReady();

	const [firstLstWithPosition, setFirstLstWithPosition] = useState<LST>(
		Env.defaultActiveLst
	);

	const hasSetFirstLstWithPosition = useRef(false);

	useEffect(() => {
		checkSuperstakePositions();
	}, [driftClientIsReady, driftClient, commonStore.userAccounts]);

	const checkSuperstakePositions = () => {
		if (!hasSetFirstLstWithPosition.current) {
			const superstakePositions = ALL_LST.map((lst) =>
				hasSuperstakePosition(lst)
			);

			if (superstakePositions.every((pos) => pos === undefined)) {
				// either no superstake positions or user accounts not fetched yet
				return;
			}

			const firstLstWithPositionIndex = superstakePositions.findIndex(
				(hasPosition) => hasPosition
			);

			if (firstLstWithPositionIndex !== -1) {
				setFirstLstWithPosition(ALL_LST[firstLstWithPositionIndex]);
			}
		}
	};

	function hasSuperstakePosition(lst: LST) {
		const superStakeAccount = commonStore.userAccounts.find((account) => {
			return decodeName(account.name) === lst.driftAccountName;
		});

		const solSpotPosition = superStakeAccount?.spotPositions.find(
			(position) => {
				return position.marketIndex === 1;
			}
		);
		const lstSpotPosition = superStakeAccount?.spotPositions.find(
			(position) => {
				return position.marketIndex === lst.spotMarket.marketIndex;
			}
		);

		if (!solSpotPosition || !lstSpotPosition) {
			return undefined;
		}

		const hasSolBorrow =
			BigNum.from(solSpotPosition?.scaledBalance).gtZero() &&
			matchEnum(solSpotPosition?.balanceType, SpotBalanceType.BORROW);
		const hasLstDeposit =
			BigNum.from(lstSpotPosition?.scaledBalance).gtZero() &&
			matchEnum(lstSpotPosition?.balanceType, SpotBalanceType.DEPOSIT);

		return hasSolBorrow && hasLstDeposit;
	}

	return firstLstWithPosition;
}
