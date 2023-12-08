import { useEffect, useMemo, useState } from 'react';
import useAppStore from './useAppStore';
import { BigNum, calculateSolEarned } from '@drift-labs/sdk';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { SOL_PRECISION_EXP } from '../utils/uiUtils';

const useUserSolEarned = () => {
	const depositRecords = useAppStore((s) => s.eventRecords.depositRecords);
	const isDepositRecordsLoaded = useAppStore((s) => s.eventRecords.loaded);
	const currentUserData = useAppStore((s) => s.currentUserAccount);
	const driftClientIsReady = useCustomDriftClientIsReady();
	const [solEarned, setSolEarned] = useState(BigNum.zero(SOL_PRECISION_EXP));
	const [loaded, setLoaded] = useState(false);
	const activeLst = useAppStore((s) => s.activeLst);

	useEffect(() => {
		(async () => {
			if (
				!currentUserData?.user ||
				!currentUserData?.user.isSubscribed ||
				!driftClientIsReady
			) {
				setSolEarned(BigNum.zero(SOL_PRECISION_EXP));
				setLoaded(false);
				return;
			}

			const userSolEarned = await calculateSolEarned({
				marketIndex: activeLst.spotMarket.marketIndex,
				user: currentUserData.user,
				depositRecords: depositRecords,
			});
			setSolEarned(BigNum.from(userSolEarned, SOL_PRECISION_EXP));
			setLoaded(isDepositRecordsLoaded);
		})();
	}, [depositRecords?.length, !!currentUserData, driftClientIsReady]);

	return useMemo(() => {
		return { solEarned, loaded };
	}, [solEarned, loaded]);
};

export default useUserSolEarned;
