import { useWallet } from '@drift-labs/react';
import posthog from 'posthog-js';
import { useEffect } from 'react';

const useInitPostHogUser = () => {
	const walletContext = useWallet();
	const publicKey = walletContext?.publicKey;

	useEffect(() => {
		if (!publicKey) {
			try {
				posthog.reset();
			} catch {
				// ignore
			}
		} else {
			posthog.identify(publicKey.toBase58());
		}
	}, [publicKey, posthog]);
};

export default useInitPostHogUser;
