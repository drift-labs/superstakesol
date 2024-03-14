import { SLIPPAGE_TOLERANCE_DEFAULT } from '../constants';
import {
	AppStoreState,
	DEFAULT_STORE_STATE,
	DEFAULT_USER_DATA,
} from '../hooks/useAppStore';
import { SOL_SPOT_MARKET_INDEX, decodeName } from '../utils/uiUtils';
import {
	BN,
	BigNum,
	JupiterClient,
	PublicKey,
	SpotMarkets,
	ZERO,
	fetchUserStatsAccount,
	findBestSuperStakeIxs,
	SwapReduceOnly,
	getUserAccountPublicKeySync,
	TEN_THOUSAND,
	LAMPORTS_PRECISION,
	FOUR,
	TxParams,
	// UserAccount,
} from '@drift-labs/sdk';
import { COMMON_UI_UTILS } from '@drift/common';
import {
	createCloseAccountInstruction,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
	AddressLookupTableAccount,
	LAMPORTS_PER_SOL,
	Signer,
	TransactionInstruction,
} from '@solana/web3.js';
import { StoreApi } from 'zustand';
import NOTIFICATION_UTILS from '../utils/notify';
import { CommonDriftStore, PriorityFeeStore } from '@drift-labs/react';
import invariant from 'tiny-invariant';
import { ALL_LST_MAP, LST } from '../constants/lst';
import { getSwapQuote } from '../utils/getSwapQuote';
import { SSS_TRANSACTION_COMPUTE_UNITS_LIMIT } from '../constants/environment';

const DEPOSIT_TOAST_ID = 'deposit_toast';

type DepositProps = {
	/**
	 * Initial amount of LDF to deposit as collateral
	 */
	lstDepositAmount: BN;

	/**
	 * Amount of SOL to borrow/swap to reach desired leverage
	 */
	solBorrowAmount: BN;

	/**
	 * The associated token account of the LST to deposit from
	 */
	fromTokenAccount: PublicKey;

	/**
	 * The price of LST in terms of SOL
	 */
	lstSolPrice: number;

	/**
	 * The LST to deposit.
	 */
	lst: LST;
};

const createAppActions = (
	get: StoreApi<AppStoreState>['getState'],
	set: (x: (s: AppStoreState) => void) => void,
	getCommon: StoreApi<CommonDriftStore>['getState'],
	setCommon: (x: (s: CommonDriftStore) => void) => void,
	getPriorityFeeToUse: PriorityFeeStore['getPriorityFeeToUse']
) => {
	const getTxParams = (
		computeUnits = SSS_TRANSACTION_COMPUTE_UNITS_LIMIT
	): TxParams => {
		const { computeUnitsPrice } = getPriorityFeeToUse(computeUnits);

		console.log(
			`Using compute unit price ${computeUnitsPrice} for tx with ${computeUnits} compute units. Estimated priority fee = ${
				(computeUnitsPrice * computeUnits) / 10 ** 6 / LAMPORTS_PER_SOL
			} SOL`
		);

		return {
			computeUnitsPrice: computeUnitsPrice,
			computeUnits: computeUnits,
		};
	};

	/**
	 * Returns the ID of the current super stake account or the id for tne new super stake account to create if it doesn't exist
	 * @returns
	 */
	const getSubaccountIdForSuperStakeAccount = async () => {
		const commonState = getCommon();
		const driftClient = commonState.driftClient.client;
		const activeLst = get().activeLst;

		invariant(driftClient, 'Drift client is undefined');
		invariant(commonState.connection, 'Connection is undefined');

		try {
			const subaccounts = await driftClient.getUserAccountsForAuthority(
				commonState.authority
			);

			// If drift account exists, either find superstake subaccount, or create new one
			const superStakeAccount = subaccounts.find((account) => {
				return (
					account && decodeName(account.name) === activeLst.driftAccountName
				);
			});

			if (superStakeAccount) {
				return superStakeAccount.subAccountId;
			}

			// Subaccount for current LST doen't exist
			// But user may have a stats account already
			// If we do we want to return the next available subaccount id
			const userStatsAccount = await fetchUserStatsAccount(
				commonState.connection,
				driftClient.program,
				commonState.authority
			);

			return userStatsAccount?.numberOfSubAccountsCreated ?? 0;
		} catch (err) {
			// We should never get here now, but just leaving the catch here in case it does happen again.
			console.log(err);
			return 0;
		}
	};

	const checkSuperStakeLstSubaccountForAuthority = async (
		lst: LST,
		authority: PublicKey
	) => {
		const commonState = getCommon();
		const driftClient = commonState.driftClient.client;

		const subAccounts =
			await driftClient.getUserAccountsForAuthority(authority);

		const driftAccountExists = subAccounts.length > 0;

		if (!driftAccountExists) {
			return false;
		}

		const superStakeAccount = subAccounts.find((account) => {
			return decodeName(account.name) === lst.driftAccountName;
		});

		return !!superStakeAccount;
	};

	/**
	 * Does a super stake deposit. Creates the subaccount if it doesn't exist.
	 *
	 * Right now the spot markets will be hard coded because I can't see how this would work with any other spot markets besides SOL and the LST
	 */
	const doDepositTx = async (
		props: DepositProps,
		superstakeSubAccountId: number
	) => {
		const commonState = getCommon();
		const driftClient = commonState.driftClient.client;
		const jupiterClient = new JupiterClient({
			connection: commonState.connection,
		});

		const lstSpotMarket = props.lst.spotMarket;
		const solSpotMarket = (
			SpotMarkets[commonState.env.driftEnv] || SpotMarkets['mainnet-beta']
		).find((market) => market.symbol === 'SOL');

		invariant(lstSpotMarket, 'LST spot market is undefined');
		invariant(solSpotMarket, 'SOL spot market is undefined');
		invariant(driftClient, 'Drift client is undefined');
		invariant(commonState.authority, 'Authority is undefined');
		invariant(commonState.connection, 'Connection is undefined');

		// Sign, send and confirm tx here
		NOTIFICATION_UTILS.toast('Sending Transaction', {
			toastId: DEPOSIT_TOAST_ID,
		});

		const instructions: TransactionInstruction[] = [];

		let sssAccountPublicKey: PublicKey;
		try {
			sssAccountPublicKey = getUserAccountPublicKeySync(
				driftClient.program.programId,
				commonState.authority,
				superstakeSubAccountId
			);
		} catch (err) {
			console.log('no sssAccountPublicKey');
		}

		const onlyDirectRoutes = !!props.lst?.onlyDirectRoute;
		// asynchronously fetch best super stake instructions
		const bestSuperStakeIxsPromise = findBestSuperStakeIxs({
			jupiterClient,
			driftClient,
			amount: props.solBorrowAmount,
			userAccountPublicKey: sssAccountPublicKey,
			price: props.lstSolPrice,
			onlyDirectRoutes,
			marketIndex: props.lst.spotMarket.marketIndex,
		});

		const subAccounts = await driftClient.getUserAccountsForAuthority(
			commonState.authority
		);
		const driftAccountExists = subAccounts.length > 0;

		let creatingNewUser = false;

		if (!driftAccountExists) {
			// If no drift account exists, create subaccount and use it as the superstake account
			creatingNewUser = true;

			const [_, initializeSssAccountIx] =
				await driftClient.getInitializeUserInstructions(
					superstakeSubAccountId,
					props.lst.driftAccountName
				);

			if (superstakeSubAccountId === 0) {
				instructions.push(await driftClient.getInitializeUserStatsIx());
			}

			instructions.push(initializeSssAccountIx);

			const lstDepositIx = await driftClient.getDepositInstruction(
				props.lstDepositAmount,
				lstSpotMarket.marketIndex,
				props.fromTokenAccount,
				superstakeSubAccountId,
				false,
				false
			);
			instructions.push(lstDepositIx);
		} else {
			// If drift account exists, either find superstake  subaccount, or create new one
			const superStakeAccount = subAccounts.find((account) => {
				return decodeName(account.name) === props.lst.driftAccountName;
			});

			if (superStakeAccount) {
				driftClient.switchActiveUser(superstakeSubAccountId);

				const lstDepositIx = await driftClient.getDepositInstruction(
					props.lstDepositAmount,
					lstSpotMarket.marketIndex,
					props.fromTokenAccount,
					superstakeSubAccountId
				);

				instructions.push(lstDepositIx);
			} else {
				if (superstakeSubAccountId === 0) {
					// We should never get here - where driftAccountExists is true but we're trying to create a new account with ID=0.
					//// Attempt to give a friendly error back to the user
					throw new Error(
						`An error (bad subaccount id) occurred. Please refresh the page and try again.`
					);
				}

				creatingNewUser = true;

				const [_sssAccountPublicKey, initializeSssAccountIx] =
					await driftClient.getInitializeUserInstructions(
						superstakeSubAccountId,
						props.lst.driftAccountName
					);

				sssAccountPublicKey = _sssAccountPublicKey;
				const lstDepositIx = await driftClient.getDepositInstruction(
					props.lstDepositAmount,
					lstSpotMarket.marketIndex,
					props.fromTokenAccount,
					superstakeSubAccountId,
					false,
					false
				);
				instructions.push(initializeSssAccountIx);
				instructions.push(lstDepositIx);
			}
		}

		const enableMarginTradingIx =
			await driftClient.getUpdateUserMarginTradingEnabledIx(
				true,
				superstakeSubAccountId,
				sssAccountPublicKey
			);
		instructions.push(enableMarginTradingIx);

		let swapInstructions: TransactionInstruction[] = [];
		let lookupTables: AddressLookupTableAccount[];

		if (props.solBorrowAmount.gt(ZERO)) {
			// Add swap instructions (SOL -> LST)
			const {
				ixs: _swapInstructions,
				lookupTables: _lookupTables,
				// method,
				// price,
			} = await bestSuperStakeIxsPromise;

			swapInstructions = _swapInstructions;
			lookupTables = _lookupTables;
		}

		const allInstructions = [...instructions, ...swapInstructions];

		const tx = await driftClient.buildTransaction(
			allInstructions,
			getTxParams(),
			0,
			// @ts-ignore
			lookupTables
		);

		// Pre-Flight safety check before sending transaction. To ENSURE we're not creating duplicate superstake acounts.
		if (creatingNewUser) {
			const currentUserAccountsForAuthority =
				await driftClient.getUserAccountsForAuthority(commonState.authority);

			const preExistingSuperstakeAccount = currentUserAccountsForAuthority.find(
				(account) => decodeName(account.name) === props.lst.driftAccountName
			);

			invariant(
				!preExistingSuperstakeAccount,
				'Trying to create a duplicate superstake account'
			);
		}

		const { txSig: _txSig, slot: _slot } =
			await driftClient.sendTransaction(tx);

		await driftClient.addUser(superstakeSubAccountId, commonState.authority);
	};

	const stopPollingForNewAccount = () => {
		clearInterval(get().newAccountPollingTimer);
	};

	const pollForNewAccount = () => {
		const authority = getCommon().authority;
		const connected = getCommon().currentlyConnectedWalletContext.connected;
		let retries = 10;

		const timer = setInterval(async () => {
			if (!connected || retries === 0) {
				stopPollingForNewAccount();
				return;
			}

			const superStakeAccount = await getSuperStakeAccount(authority);

			if (superStakeAccount) {
				await switchActiveSubaccount(superStakeAccount.subAccountId, authority);
				await updateCurrentUserData();
				stopPollingForNewAccount();
			}

			retries--;
		}, 1000);

		set((s) => {
			s.newAccountPollingTimer = timer;
		});
	};

	/**
	 * Outer method to handle a deposit
	 *
	 * @param props
	 * @returns
	 */
	const handleSuperStakeDeposit = async (props: DepositProps) => {
		try {
			const state = get();
			const commonState = getCommon();
			const driftClient = commonState.driftClient.client;

			invariant(driftClient, 'Drift client is undefined');

			const superStakeAccountId = await getSubaccountIdForSuperStakeAccount();
			const superStakeUser = state.currentUserAccount?.user;

			if (superStakeUser) {
				await doDepositTx(props, superStakeAccountId);
			} else {
				await COMMON_UI_UTILS.initializeAndSubscribeToNewUserAccount(
					// @ts-ignore
					driftClient,
					superStakeAccountId,
					commonState.authority as PublicKey,
					{
						initializationStep: async () => {
							await doDepositTx(props, superStakeAccountId);
							return true;
						},
						//@ts-ignore
						handleSuccessStep: async () => {
							NOTIFICATION_UTILS.toast.success(
								`Super Staked ${BigNum.from(
									props.lstDepositAmount,
									props.lst.spotMarket.precisionExp
								).prettyPrint(true)} ${props.lst.symbol} Successfully`,
								{
									toastId: DEPOSIT_TOAST_ID,
								}
							);
							pollForNewAccount();
						},
					}
				);
			}
		} catch (err) {
			console.log(err);
			if ((err as any)?.logs) {
				console.log((err as any)?.logs);
			}

			// TODO: abstract TransactionErrorHandler from main UI into common
			if (err.message.includes('0x1850')) {
				NOTIFICATION_UTILS.toast.error(
					'We have reached the maximum capacity of users. Please try again later.'
				);
			} else {
				NOTIFICATION_UTILS.toast.error(err.message);
			}

			return false;
		}
	};

	/*
	 * Second step of closing superstake position, just withdraws LST and SOL
	 */
	const handleSuperStakeWithdrawal = async ({
		lstWithdrawalAmount,
		solWithdrawalAmount,
		subAccountId,
	}: {
		lstWithdrawalAmount: BN;
		solWithdrawalAmount: BN;
		subAccountId: number;
	}) => {
		try {
			const commonState = getCommon();
			const driftClient = commonState.driftClient.client;
			const activeLst = get().activeLst;

			const lstSpotMarket = activeLst.spotMarket;
			const solSpotMarket = (
				SpotMarkets[commonState.env.driftEnv] || SpotMarkets['mainnet-beta']
			).find((market) => market.symbol === 'SOL');

			invariant(lstSpotMarket, 'LST spot market is undefined');
			invariant(solSpotMarket, 'SOL spot market is undefined');
			invariant(driftClient, 'Drift client is undefined');
			invariant(commonState.authority, 'Authority is undefined');
			invariant(commonState.connection, 'Connection is undefined');

			driftClient.switchActiveUser(subAccountId);

			const additionalSigners: Signer[] = [];
			const withdrawInstructions: TransactionInstruction[] = [];

			let ataExists;
			const ataPublicKey = getAssociatedTokenAddressSync(
				lstSpotMarket.mint,
				commonState.authority
			);

			try {
				const accountInfo =
					await commonState.connection.getAccountInfo(ataPublicKey);
				ataExists = accountInfo != null;
			} catch (e) {
				ataExists = false;
			}

			if (!ataExists) {
				const createAssociatedTokenAccountIx =
					driftClient.getAssociatedTokenAccountCreationIx(
						lstSpotMarket.mint,
						ataPublicKey
					);
				withdrawInstructions.push(createAssociatedTokenAccountIx);
			}

			const lstWithdrawIx = await driftClient.getWithdrawIx(
				lstWithdrawalAmount,
				lstSpotMarket.marketIndex,
				ataPublicKey,
				true
			);
			withdrawInstructions.push(lstWithdrawIx);

			// SOL withdrawal instructions to withdraw dust
			if (solWithdrawalAmount.gt(ZERO)) {
				const {
					ixs,
					signers,
					pubkey: wrappedSolAta,
				} = await driftClient.getWrappedSolAccountCreationIxs(
					solWithdrawalAmount,
					false
				);

				ixs.forEach((ix: TransactionInstruction) => {
					withdrawInstructions.push(ix);
				});

				signers.forEach((signer: Signer) => additionalSigners.push(signer));

				const solWithdrawIx = await driftClient.getWithdrawIx(
					solWithdrawalAmount,
					solSpotMarket.marketIndex,
					wrappedSolAta,
					true
				);
				withdrawInstructions.push(solWithdrawIx);

				withdrawInstructions.push(
					createCloseAccountInstruction(
						wrappedSolAta,
						commonState.authority,
						commonState.authority,
						[]
					)
				);
			}

			const tx = await driftClient.buildTransaction(
				withdrawInstructions,
				getTxParams(),
				0
			);

			const { txSig: _txSig, slot: _slot } = await driftClient.sendTransaction(
				tx,
				additionalSigners
			);

			NOTIFICATION_UTILS.toast.success(`Unstaked Successfully`);
		} catch (err) {
			console.log(err);

			// @ts-ignore
			NOTIFICATION_UTILS.toast.error(err.message);

			if ((err as any)?.logs) {
				console.log((err as any)?.logs);
			}

			return false;
		}
	};

	/**
	 * First step of closing superstake position, repays SOL borrow with jupiter swap
	 */
	const handleSuperStakeRepayBorrow = async ({
		subAccountId,
		solSwapOutAmount,
		slippageBps,
	}: {
		/**
		 * Subaccount to use, probably the superstake subaccount but caller should decide this
		 */
		subAccountId: number;

		/**
		 * Amount of SOL to receive at end of swap
		 */
		solSwapOutAmount: BN;

		/*
		 * Swap slippage tolerance in bps
		 */
		slippageBps?: number;
	}) => {
		try {
			const commonState = getCommon();
			const driftClient = commonState.driftClient.client;
			const activeLst = get().activeLst;

			const lstSpotMarket = activeLst.spotMarket;
			const solSpotMarket = (
				SpotMarkets[commonState.env.driftEnv] || SpotMarkets['mainnet-beta']
			).find((market) => market.symbol === 'SOL');

			invariant(lstSpotMarket, 'LST spot market is undefined');
			invariant(solSpotMarket, 'SOL spot market is undefined');
			invariant(driftClient, 'Drift client is undefined');
			invariant(commonState.authority, 'Authority is undefined');
			invariant(commonState.connection, 'Connection is undefined');

			driftClient.switchActiveUser(subAccountId);

			const jupiterClient = new JupiterClient({
				connection: commonState.connection,
			});

			const slippageBpsToUse =
				slippageBps && !isNaN(slippageBps) && slippageBps > 0
					? Math.floor(slippageBps)
					: SLIPPAGE_TOLERANCE_DEFAULT * 100;

			const swapQuote = await getSwapQuote({
				swapAmount: solSwapOutAmount,
				swapFromMarket: lstSpotMarket,
				swapToMarket: solSpotMarket,
				jupiterClient,
				slippageBps: slippageBpsToUse,
				swapMode: 'ExactOut',
			});

			const { ixs: swapInstructions, lookupTables } =
				await driftClient.getJupiterSwapIxV6({
					jupiterClient,
					inMarketIndex: lstSpotMarket.marketIndex,
					outMarketIndex: solSpotMarket.marketIndex,
					amount: solSwapOutAmount,
					slippageBps: slippageBpsToUse,
					swapMode: 'ExactOut',
					reduceOnly: SwapReduceOnly.In,
					onlyDirectRoutes: activeLst?.onlyDirectRoute,
					quote: swapQuote,
				});

			const tx = await driftClient.buildTransaction(
				swapInstructions,
				getTxParams(),
				0,
				lookupTables
			);

			const { txSig: _txSig, slot: _slot } =
				await driftClient.sendTransaction(tx);
		} catch (err) {
			console.log(err);
			if ((err as any)?.logs) {
				console.log((err as any)?.logs);
			}

			return false;
		}
	};

	// Switches active LST. Does NOT switch the subaccount automatically
	const switchActiveLst = (newLstSymbol: string) => {
		const lstData = ALL_LST_MAP[newLstSymbol];

		if (!lstData) {
			throw new Error(`"No LST exists with symbol ${newLstSymbol}`);
		}

		set((state) => {
			state.activeLst = lstData;
			state.stakeUnstakeForm = {
				...DEFAULT_STORE_STATE.stakeUnstakeForm,
				leverageToUse: lstData?.defaultLeverage ?? 2,
				unstakeLeverage: 0,
			};
		});
	};

	// Resets the current subaccount / user data
	const resetCurrentUserData = (loaded?: boolean) => {
		set((s) => {
			s.currentUserAccount = { ...DEFAULT_USER_DATA, loaded: !!loaded };
			s.eventRecords = {
				depositRecords: [],
				swapRecords: [],
				mostRecentTx: undefined,
				loaded: !!loaded,
			};
		});
		setCommon((s) => {
			s.userAccounts = [];
		});
	};

	const getSuperStakeAccount = async (authority: PublicKey) => {
		const activeLst = get().activeLst;
		const driftClient = getCommon().driftClient?.client;

		if (!driftClient || !authority) {
			return;
		}

		const userAccounts =
			await driftClient.getUserAccountsForAuthority(authority);

		const superStakeAccount = userAccounts.find((account) => {
			return decodeName(account.name) === activeLst.driftAccountName;
		});

		return superStakeAccount;
	};

	const switchSubaccountToActiveLst = async (
		currentLstPrice?: number,
		authorityParam?: PublicKey
	) => {
		let authority = authorityParam;
		if (!authority) {
			authority = getCommon().currentlyConnectedWalletContext?.publicKey;
		}

		const superStakeAccount = await getSuperStakeAccount(authority);

		if (!superStakeAccount) {
			resetCurrentUserData(true);
			return;
		}

		resetCurrentUserData(false);
		await switchActiveSubaccount(superStakeAccount.subAccountId, authority);
		await updateCurrentUserData(currentLstPrice);
	};

	// Updates current user lst subaccount data in the store w/ latest data stored in memory by driftClient
	const updateCurrentUserData = async (currentLstPrice?: number) => {
		const driftClient = getCommon().driftClient;
		const superStakeUser = driftClient.client.getUser();

		if (superStakeUser) {
			const superStakeAccount = superStakeUser.getUserAccount();
			const activeLst = get().activeLst;

			let leverage = new BN(0);
			if (superStakeUser && currentLstPrice) {
				const lstTokenAmount = superStakeUser.getTokenAmount(
					activeLst.spotMarket.marketIndex
				);
				const solTokenAmount = superStakeUser.getTokenAmount(
					SOL_SPOT_MARKET_INDEX
				);
				if (solTokenAmount.lt(ZERO)) {
					const lstRatioBN = new BN(currentLstPrice * LAMPORTS_PER_SOL);
					// lst deposit / (lst deposit - abs(sol borrow) / lst ratio)
					leverage = lstTokenAmount
						.mul(TEN_THOUSAND)
						.div(
							lstTokenAmount.sub(
								solTokenAmount.abs().mul(LAMPORTS_PRECISION).div(lstRatioBN)
							)
						);
				}
			}

			set((s) => {
				s.currentUserAccount = {
					user: superStakeUser,
					userAccount: superStakeAccount,
					leverage: BigNum.from(leverage ?? 0, FOUR).toNum(),
					spotPositions: superStakeAccount?.spotPositions || [],
					accountId: superStakeAccount?.subAccountId,
					loaded: true,
				};
			});
		} else {
			resetCurrentUserData(true);
		}
	};

	// Switch active subaccount in drift client without updating the store state for it
	const switchActiveSubaccount = async (
		subAccountId: number,
		authorityParam?: PublicKey
	) => {
		let authority = authorityParam;
		if (!authority) {
			authority = getCommon().currentlyConnectedWalletContext?.publicKey;
		}

		if (!authority) {
			return;
		}

		const driftClient = getCommon().driftClient?.client;

		if (!driftClient) {
			return;
		}

		await driftClient.switchActiveUser(subAccountId, authority);

		await driftClient.addUser(subAccountId, authority);
	};

	return {
		handleSuperStakeDeposit,
		handleSuperStakeWithdrawal,
		handleSuperStakeRepayBorrow,
		resetCurrentUserData,
		switchActiveLst,
		switchActiveSubaccount,
		switchSubaccountToActiveLst,
		updateCurrentUserData,
		checkSuperStakeLstSubaccountForAuthority,
	};
};

export default createAppActions;
