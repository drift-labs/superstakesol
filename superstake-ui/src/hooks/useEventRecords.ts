import {
	DepositRecord,
	DriftClient,
	fetchLogs,
	LogParser,
	User,
	Event,
	SwapRecord,
	PublicKey,
} from '@drift-labs/sdk';
import { Connection } from '@solana/web3.js';
import { useEffect, useRef } from 'react';
import { useInterval } from 'react-use';
import Env from '../constants/environment';
import useAppStore from './useAppStore';
import { useCommonDriftStore } from '@drift-labs/react';
import { useWallet } from '@drift-labs/react';

const useEventRecords = () => {
	const wallet = useWallet();
	const connected = wallet?.connected;
	const connection = useCommonDriftStore((s) => s.connection) as Connection;
	const set = useAppStore((s) => s.set);
	const currentUser = useAppStore((s) => s.currentUserAccount.user) as User;
	const driftClient = useCommonDriftStore(
		(s) => s.driftClient.client
	) as DriftClient;
	const mostRecentTx = useAppStore((s) => s.eventRecords.mostRecentTx);

	const accountBeingFetched = useRef<PublicKey | null>(null); // used to prevent updating state with the previous LST's data

	const handleNewEvents = (
		mostRecentTx: string,
		depositRecords: Event<DepositRecord>[],
		swapRecords: Event<SwapRecord>[]
	) => {
		console.log(`Received event records`);
		set((s) => {
			s.eventRecords = {
				depositRecords: [...s.eventRecords.depositRecords, ...depositRecords],
				swapRecords: [...s.eventRecords.swapRecords, ...swapRecords],
				mostRecentTx,
				loaded: true,
			};
		});
	};

	const getEvents = async (
		connection: Connection,
		driftClient: DriftClient,
		user: User,
		mostRecentTx: string | undefined,
		setLoadingState?: boolean
	) => {
		if (accountBeingFetched.current === user.getUserAccountPublicKey()) {
			return;
		}
		accountBeingFetched.current = user.getUserAccountPublicKey();

		console.log(`Getting events`);
		if (setLoadingState) {
			set((s) => {
				console.log(`Setting event record loading state`);
				s.eventRecords = {
					...s.eventRecords,
					loaded: false,
				};
			});
		}

		const response = await fetchLogs(
			connection,
			user.getUserAccountPublicKey(),
			'confirmed',
			undefined,
			mostRecentTx
		);

		if (accountBeingFetched.current !== user.getUserAccountPublicKey()) {
			// if the account being fetched has changed since the fetch started, don't update the state
			return;
		}

		if (!response) {
			accountBeingFetched.current = null;
			if (setLoadingState) {
				set((s) => {
					s.eventRecords = {
						...s.eventRecords,
						loaded: true,
					};
				});
			}
			return;
		}

		const logParser = new LogParser(driftClient.program);

		const depositRecords = Array<Event<DepositRecord>>();
		const swapRecords = Array<Event<SwapRecord>>();
		for (const log of response.transactionLogs) {
			const events = logParser.parseEventsFromLogs(log);
			for (const event of events) {
				if (event.eventType === 'DepositRecord') {
					// @ts-ignore
					depositRecords.push(event);
				}
				if (event.eventType === 'SwapRecord') {
					// @ts-ignore
					swapRecords.push(event);
				}
			}
		}

		handleNewEvents(response.mostRecentTx, depositRecords, swapRecords);
		accountBeingFetched.current = null;
	};

	const updateEvents = (setLoadingState?: boolean) => {
		if (connection && currentUser && driftClient) {
			getEvents(
				connection,
				driftClient,
				currentUser,
				mostRecentTx,
				setLoadingState
			);
		}
	};

	useEffect(() => {
		updateEvents(true);
	}, [connected, connection, currentUser]);

	useInterval(() => {
		if (connected) {
			updateEvents();
		}
	}, Env.basePollingRateMs);
};

export default useEventRecords;
