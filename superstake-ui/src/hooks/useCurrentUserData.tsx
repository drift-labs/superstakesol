'use client';

import { useEffect, useMemo } from 'react';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import useAppStore from './useAppStore';
import { useCommonDriftStore } from '@drift-labs/react';
import { useWallet } from '@drift-labs/react';
import useCurrentLstMetrics from './useCurrentLstMetrics';
import { useAppActions } from './useAppActions';

const useCurrentUserData = () => {
	const activeLst = useAppStore((s) => s.activeLst);
	const superStakeUser = useAppStore((s) => s.currentUserAccount.user);
	const actions = useAppActions();
	const driftClientIsReady = useCustomDriftClientIsReady();
	const { connected } = useWallet();
	const appAuthority = useCommonDriftStore((s) => s.authority);
	const lstMetrics = useCurrentLstMetrics();

	// Just like in drift main ui this should prob be stringified in the common store
	const appAuthorityString = useMemo(() => {
		return appAuthority ? appAuthority.toString() : '';
	}, [appAuthority]);

	// Initially switch to superstake user account when drift client is ready and metrics are loaded
	// Sometimes this randomly triggers even though none of the values have changed and I don't know why.
	useEffect(() => {
		if (
			connected &&
			driftClientIsReady &&
			appAuthorityString &&
			lstMetrics.loaded
		) {
			actions.switchSubaccountToActiveLst(lstMetrics.priceInSol);
		} else if ((!connected || !appAuthority) && superStakeUser) {
			actions.resetCurrentUserData();
		}
	}, [
		connected,
		driftClientIsReady,
		appAuthorityString,
		lstMetrics.loaded,
		activeLst,
	]);

	// Listen for user account updates, we also want this in a hook so we have access to lstMetrics.priceInSol
	useEffect(() => {
		if (!superStakeUser) {
			return;
		}

		const listenerClosingCallback = () => {
			if (!superStakeUser) {
				actions.resetCurrentUserData(true);
				return;
			}

			const updateHandler = () => {
				actions.updateCurrentUserData(lstMetrics.priceInSol);
			};

			superStakeUser.eventEmitter.on('userAccountUpdate', updateHandler);

			return () => {
				superStakeUser.eventEmitter.removeListener(
					'userAccountUpdate',
					updateHandler
				);
			};
		};

		return listenerClosingCallback();
	}, [superStakeUser]);
};

export default useCurrentUserData;
