import { PublicKey } from '@solana/web3.js';
import { useEffect, useRef } from 'react';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { useCommonDriftActions, useCommonDriftStore } from '@drift-labs/react';
import { useAppActions } from './useAppActions';

const useEmulation = () => {
	const actions = useCommonDriftActions();
	const driftClientIsReady = useCustomDriftClientIsReady();
	const setCommonStore = useCommonDriftStore((s) => s.set);
	const appActions = useAppActions();

	let urlAuthorityParam = '';
	if (typeof window !== 'undefined') {
		const searchParams = new URLSearchParams(window.location.search);
		urlAuthorityParam = searchParams.get('authority') ?? '';
	}

	const alreadyUsedRouteParams = useRef(false);

	// Handle query params from router
	useEffect(() => {
		if (!driftClientIsReady) return;

		const handler = async () => {
			if (urlAuthorityParam) {
				alreadyUsedRouteParams.current = true;

				// Must be trying to emulate an account
				//// Sometimes users accidentally type random things into the address bar which aren't a public key - avoid sending error about this and do nothing
				try {
					const authority = new PublicKey(urlAuthorityParam);
					setCommonStore((s) => {
						s.authority = authority;
						s.authorityString = `authority=${authority.toString()}`;
					});
					await actions.emulateAccount({ authority });
					appActions.updateCurrentUserData();
				} catch (e) {
					console.log('no authority: ' + urlAuthorityParam);
				}
			} else {
				setCommonStore((s) => {
					s.authorityString = '';
				});
			}
		};

		handler();
	}, [urlAuthorityParam, driftClientIsReady]);

	return null;
};

export default useEmulation;
