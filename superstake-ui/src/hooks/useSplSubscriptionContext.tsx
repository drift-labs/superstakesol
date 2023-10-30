// import { PublicKey } from '@solana/web3.js';
// import React, {
// 	PropsWithChildren,
// 	useContext,
// 	useEffect,
// 	useMemo,
// 	useState,
// } from 'react';

// /**
//  * Subscribers to the SPL balance, where the key is a unique ID for the hook, and the value is an array of mints to subscribe to
//  */
// type SPLSubscribers = Record<string, string[]>;

// type SPLBalanceInfo = {
// 	account: PublicKey;
// 	balance: number;
// };

// type SPLBalances = {
// 	/**
// 	 * SPL balances, where the key is the mint as a string, and value is the balance info
// 	 * Actually might be able to just put this in the store. Hmm.
// 	 */
// 	balances: Record<string, SPLBalanceInfo>;
// };

// const DEFAULT_BALANCES: SPLBalances = {
// 	balances: {},
// };

// const DEFAULT_SUBSCRIBERS: SPLSubscribers = {};

// export const SPLSubscriptionContext = React.createContext(DEFAULT_SUBSCRIBERS);

// const useSplSubscriptionContext = (props: PropsWithChildren) => {
// 	const [subscribers, setSubscribers] =
// 		useState<SPLSubscribers>(DEFAULT_SUBSCRIBERS);

// 	const mergedMints = Array.from(
// 		new Set(
// 			Object.values(subscribers)
// 				.filter((val) => !!val)
// 				.reduce((a = [], b = []) => [...a, ...b])
// 		)
// 	);

// 	const mergedMintsString = Array.from(mergedMints).join(',');

// 	const subscribeToBalances = (key: string, mints: string[]) => {
// 		setSubscribers({
// 			...subscribers,
// 			[key]: mints,
// 		});
// 	};

// 	const unsubscribe = (key: string) => {
// 		setSubscribers((value) => {
// 			delete value.key;
// 			return value;
// 		});
// 	};

// 	// And here we actually update the balances, if the merged list of balances to subscribe to has changed
// 	useEffect(() => {}, [mergedMintsString]);

// 	return (
// 		<SPLSubscriptionContext.Provider value={subscribers}>
// 			{props.children}
// 		</SPLSubscriptionContext.Provider>
// 	);
// };
