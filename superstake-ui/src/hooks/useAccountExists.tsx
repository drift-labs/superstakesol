import { useEffect, useState } from 'react';
// import { singletonHook } from 'react-singleton-hook';
import { useCommonDriftStore, useDriftClientIsReady } from '@drift-labs/react';
import { useWallet } from '@drift-labs/react';

export const useAccountExists = () => {
	const walletState = useWallet();
	const driftClientIsReady = useDriftClientIsReady();
	const driftClient = useCommonDriftStore((s) => s.driftClient.client);
	const userAccountNotInitialized = useCommonDriftStore(
		(s) => s.userAccountNotInitialized
	);
	const [accountExists, setAccountExists] = useState<boolean>();

	const getAndSetUserExists = async () => {
		if (!driftClient || !walletState?.wallet?.adapter?.publicKey) return;

		const subAccounts = await driftClient.getUserAccountsForAuthority(
			walletState?.wallet?.adapter?.publicKey
		);

		try {
			const user = driftClient.getUser(
				subAccounts[0]?.subAccountId,
				walletState?.wallet?.adapter?.publicKey
			);
			const userAccountExists = await user.exists();
			setAccountExists(userAccountExists);
		} catch (e) {
			setAccountExists(false);
		}
	};

	useEffect(() => {
		if (!walletState?.connected || !driftClientIsReady) return;
		getAndSetUserExists();
	}, [walletState, driftClientIsReady, userAccountNotInitialized]);

	return accountExists;
};

// export default singletonHook(false, useAccountExists);
