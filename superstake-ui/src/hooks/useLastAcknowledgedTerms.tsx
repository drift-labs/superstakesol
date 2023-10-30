import { useLocalStorage } from 'react-use';
import { singletonHook } from 'react-singleton-hook';
import { useEffect } from 'react';
import useAppStore from './useAppStore';
import { useWallet } from '@drift-labs/react';

const ACKNOWLEDGED_TERMS_VALIDITY_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

const NEW_LST_DATE_ADDED = new Date('2023-09-20'); // ensures that users acknowledge terms again when a new LST is added

const useLastAcknowledgedTerms = singletonHook(
	{ lastAcknowledgedTerms: 0, updateLastAcknowledgedTerms: () => {} },
	() => {
		const [lastAcknowledgedTerms, setLastAcknowledgedTerms] =
			useLocalStorage<number>('lastAcknowledgedTerms', 0, {
				raw: false,
				serializer: JSON.stringify,
				deserializer: JSON.parse,
			});

		const updateLastAcknowledgedTerms = () => {
			setLastAcknowledgedTerms(Date.now());
		};

		return { lastAcknowledgedTerms, updateLastAcknowledgedTerms };
	}
);

export const checkLastAcknowledgedTermsValidity = (
	lastAcknowledgedTerms: number | undefined
) => {
	const currentTime = Date.now();

	return (
		lastAcknowledgedTerms &&
		lastAcknowledgedTerms + ACKNOWLEDGED_TERMS_VALIDITY_PERIOD > currentTime &&
		lastAcknowledgedTerms > NEW_LST_DATE_ADDED.valueOf()
	);
};

export const useShowTermsModal = () => {
	const { lastAcknowledgedTerms } = useLastAcknowledgedTerms();
	const walletContext = useWallet();

	const set = useAppStore((s) => s.set);

	useEffect(() => {
		if (
			walletContext?.connected &&
			!checkLastAcknowledgedTermsValidity(lastAcknowledgedTerms)
		) {
			set((s) => {
				s.modals.showAcknowledgeTermsModal = true;
			});
		}
	}, [lastAcknowledgedTerms, walletContext?.connected]);
};

export default useLastAcknowledgedTerms;
