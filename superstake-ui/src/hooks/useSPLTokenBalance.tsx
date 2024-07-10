'use client';

import { PublicKey } from '@solana/web3.js';
import { useEffect, useRef, useState } from 'react';
import { getTokenAccount, getTokenAddress } from '@drift/common';
import { BN, BigNum } from '@drift-labs/sdk';
import { useCommonDriftStore } from '@drift-labs/react';

// TODO - this hook should return a bignum to be consistent with the app

/**
 * Listen to the SPL balance of a given token. Listens to the currently connected wallet by default, otherwise an optional target wallet can be passed in
 * @param tokenMintAddress
 * @param targetTokenAccountAddress
 * @returns
 */
const useSPLTokenBalance = (
	tokenMintAddress: string | null,
	precisionExp: BN,
	targetTokenAccountAddress?: string
) => {
	const BALANCE_ZERO = BigNum.from(0, precisionExp);
	// const getStore = useAppStore((s) => s.get);
	const connection = useCommonDriftStore((s) => s?.connection);
	const authority = useCommonDriftStore((s) => s.authority);
	const connected = !!authority;
	const [balanceLoaded, setBalanceLoaded] = useState(false);
	const [balanceBigNum, setBalanceBigNum] = useState(BALANCE_ZERO);
	const [balance, setBalance] = useState(0);
	const [targetAccountAddress, setTargetAccountAddress] = useState('');

	// Listen to SOL balance because when the SOL balance is zero, other SPL listeners don't work.
	//// When the SOL balance updates (and the user may have deposited SOL) we want to refresh the SPL token listeners
	const solBalance = useCommonDriftStore((s) => s.currentSolBalance);
	const solBalanceGreaterThanZero = solBalance.value?.gtZero?.() ?? false;

	const listener = useRef<number | null>(null);

	// get and set the balance of the target token account
	const getBalance = async () => {
		if (!connection || !authority) return BALANCE_ZERO;

		try {
			if (targetTokenAccountAddress) {
				const targetAccountBalance = await connection.getTokenAccountBalance(
					new PublicKey(targetTokenAccountAddress)
				);

				return new BigNum(
					targetAccountBalance.value.amount as string,
					precisionExp
				);
			}

			if (!tokenMintAddress) {
				return BALANCE_ZERO;
			}

			const targetAccount = await getTokenAccount(
				connection,
				tokenMintAddress,
				authority.toString()
			);

			if (!targetAccount) {
				return BALANCE_ZERO;
			}

			const newBalance =
				targetAccount.account.data.parsed.info.tokenAmount.amount;

			return new BigNum(newBalance, precisionExp);
		} catch (e) {
			// captureException(e);
			console.error(e);
			return BALANCE_ZERO;
		}
	};

	const getAndSetBalance = async () => {
		const newBalance = await getBalance();
		console.log('🚀 ~ getAndSetBalance ~ newBalance:', newBalance.toNum());
		setBalanceLoaded(true);
		setBalance(newBalance.toNum());
		setBalanceBigNum(newBalance);
	};

	// set the assosciated token address when the user is connected and we know the token mint address
	useEffect(() => {
		if (!authority) return;

		// if we are using a manual target wallet address, don't do anything
		if (targetTokenAccountAddress) {
			return;
		}

		if (!tokenMintAddress || !connected) {
			setTargetAccountAddress('');
			return;
		} else {
			(async () => {
				const targetAddress = await getTokenAddress(
					tokenMintAddress,
					authority.toString()
				);

				setTargetAccountAddress(targetAddress.toString());
			})();
		}
	}, [tokenMintAddress, connected, solBalance, authority]);

	// TODO-v2 : there's a minor bug with this hook where it seems like there's a race-condition that sometimes causes the connection to never get the token account updates. If you refresh the page and really quickly go into the deposit modal, you'll see that the balance doesn't update live
	// set a listener on the target token account when ready
	useEffect(() => {
		if (!connection) return;
		if (!connected) return;
		if (!solBalanceGreaterThanZero) return;

		// if using manual target address, set listener immediately
		if (targetTokenAccountAddress) {
			getAndSetBalance();

			if (!listener.current) {
				listener.current = connection.onAccountChange(
					new PublicKey(targetTokenAccountAddress),
					getAndSetBalance,
					'confirmed'
				);
			}
		} else {
			// else we need to be connected with current wallet to get balance
			if (connected && targetAccountAddress) {
				getAndSetBalance();

				if (!listener.current) {
					listener.current = connection.onAccountChange(
						new PublicKey(targetAccountAddress),
						getAndSetBalance,
						'confirmed'
					);
				}
			} else {
				setBalanceBigNum(BALANCE_ZERO);
				setBalance(0);
			}
		}

		return () => {
			if (listener.current && !!connection) {
				connection.removeAccountChangeListener(listener.current);
				listener.current = null;
			}
		};
	}, [
		connected,
		authority,
		targetAccountAddress,
		targetTokenAccountAddress,
		connection,
		solBalanceGreaterThanZero,
	]);

	// Just set loaded to true with value 0 if there's no sol balance?
	useEffect(() => {
		if (!solBalanceGreaterThanZero && solBalance.loaded) {
			setBalanceLoaded(true);
		}
	}, [solBalanceGreaterThanZero, solBalance.loaded]);

	return {
		balance,
		balanceBigNum,
		balanceLoaded,
		tokenAccountAddress: targetAccountAddress,
		getBalance,
	};
};

export default useSPLTokenBalance;
