import { useCommonDriftStore, useDriftClientIsReady } from '@drift-labs/react';
import { useEffect, useState } from 'react';
import { useAppActions } from './useAppActions';
import useAppStore from './useAppStore';

export const useHasSuperstakeLstSubaccount = () => {
	const authority = useCommonDriftStore((s) => s.authority);
	const activeLst = useAppStore((s) => s.activeLst);
	const appActions = useAppActions();
	const driftClientIsReady = useDriftClientIsReady();

	const [hasSuperstakeLstSubaccount, setHasSuperstakeLstSubaccount] =
		useState(false);

	useEffect(() => {
		if (!driftClientIsReady || !authority) return;

		appActions
			.checkSuperStakeLstSubaccountForAuthority(activeLst, authority)
			.then((res) => setHasSuperstakeLstSubaccount(res));
	}, [activeLst, authority, driftClientIsReady]);

	return hasSuperstakeLstSubaccount;
};
