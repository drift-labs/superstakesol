import { useEffect } from 'react';
import { BASE_PRECISION_EXP, BigNum } from '@drift-labs/sdk';
import { useWallet } from '@drift-labs/react';
import { useCommonDriftActions, useCommonDriftStore } from '@drift-labs/react';

/**
 * Keeps the authority and connected state of `WalletContext` updated in the app store when the wallet connects, disconnects, or changes.
 *
 * Also sets SOL balance in the store to 0 on disconnect.
 */
export const useSyncWalletToStore = () => {
	const actions = useCommonDriftActions();
	const set = useCommonDriftStore((s) => s.set);
	const clearUserData = useCommonDriftStore((s) => s.clearUserData);
	const walletContextState = useWallet();

	useEffect(() => {
		walletContextState?.wallet?.adapter?.on('connect', () => {
			const authority = walletContextState?.wallet?.adapter?.publicKey;

			set((s) => {
				s.currentSolBalance = {
					value: new BigNum(0, BASE_PRECISION_EXP),
					loaded: false,
				};
				s.authority = authority;
				s.authorityString = authority?.toString() || '';
			});

			if (authority && walletContextState.wallet?.adapter) {
				clearUserData();
				actions.handleWalletConnect(
					authority,
					walletContextState.wallet?.adapter
				);
			}
		});

		walletContextState?.wallet?.adapter?.on('disconnect', () => {
			console.log('disconnecting');
			set((s) => {
				s.currentSolBalance = {
					value: new BigNum(0, BASE_PRECISION_EXP),
					loaded: false,
				};
				s.authority = undefined;
				s.authorityString = '';
			});

			actions.handleWalletDisconnect();
			clearUserData();
			console.log('disconnecting finish');
		});

		return () => {
			console.log('adapter changed, firing off');
			walletContextState?.wallet?.adapter.off('connect');
			walletContextState?.wallet?.adapter.off('disconnect');
		};
	}, [walletContextState?.wallet?.adapter]);

	// useEffect(() => {
	// 	set((s) => {
	// 		s.authority = walletContext?.wallet?.adapter?.publicKey;
	// 		s.authorityString =
	// 			walletContext?.wallet?.adapter?.publicKey?.toString() || '';
	// 	});
	// }, [walletContext?.wallet?.adapter?.publicKey]);
};
