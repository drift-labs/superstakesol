import { SLIPPAGE_TOLERANCE_DEFAULT } from "../constants";
import { AppStoreState, DEFAULT_STORE_STATE, DEFAULT_USER_DATA } from "../hooks/useAppStore";
import { SOL_SPOT_MARKET_INDEX, decodeName } from "../utils/uiUtils";
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
} from "@drift-labs/sdk";
import { COMMON_UI_UTILS } from "@drift/common";
import {
  createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  LAMPORTS_PER_SOL,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import { StoreApi } from "zustand";
import NOTIFICATION_UTILS from "../utils/notify";
import { CommonDriftStore } from "@drift-labs/react";
import invariant from "tiny-invariant";
import { ALL_LST, LST } from "../constants/lst";

const DEPOSIT_TOAST_ID = "deposit_toast";

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
  get: StoreApi<AppStoreState>["getState"],
  set: (x: (s: AppStoreState) => void) => void,
  getCommon: StoreApi<CommonDriftStore>["getState"],
  setCommon: (x: (s: CommonDriftStore) => void) => void
) => {
  /**
   * Returns the ID of the current super stake account or the id for tne new super stake account to create if it doesn't exist
   * @returns
   */
  const getSubaccountIdForSuperStakeAccount = async () => {
    const commonState = getCommon();
    const driftClient = commonState.driftClient.client;

    const activeLst = get().getActiveLst();

    invariant(driftClient, "Drift client is undefined");
    invariant(commonState.connection, "Connection is undefined");

    try {
      const userAccounts = driftClient
        .getUsers()
        .map((u) => u.getUserAccount());

      // If drift account exists, either find superstake subaccount, or create new one
      const superStakeAccount = userAccounts.find((account) => {
        return decodeName(account.name) === activeLst.driftAccountName;
      });

      if (superStakeAccount) {
        return superStakeAccount.subAccountId;
      }

      const userStatsAccount = await fetchUserStatsAccount(
        commonState.connection,
        driftClient.program,
        driftClient.authority
      );

      return userStatsAccount?.numberOfSubAccountsCreated ?? 0;
    } catch (err) {
      console.log(err);
      // TODO: dangerously assume user is new, this is a workaround for catching the error when a new user tries to deposit,
      // but because a new user is added to the drift client before this step, u.getUserAccount() above will throw an error
      // when attempted on the new user. forgot when the logic of adding a new user to the drift client was added, will need
      // a more thorough debugging again (chester)
      return 0;
    }
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

    const lstSpotMarket = props.lst.spotMarket;
    const solSpotMarket = (
      SpotMarkets[commonState.env.driftEnv] || SpotMarkets["mainnet-beta"]
    ).find((market) => market.symbol === "SOL");

    invariant(lstSpotMarket, "LST spot market is undefined");
    invariant(solSpotMarket, "SOL spot market is undefined");
    invariant(driftClient, "Drift client is undefined");
    invariant(commonState.authority, "Authority is undefined");
    invariant(commonState.connection, "Connection is undefined");

    const instructions: TransactionInstruction[] = [];

    let sssAccountPublicKey: PublicKey = getUserAccountPublicKeySync(
      driftClient.program.programId,
      commonState.authority,
      superstakeSubAccountId
    );

    const subAccounts = await driftClient.getUserAccountsForAuthority(
      driftClient.authority
    );
    const driftAccountExists = subAccounts.length > 0;

    let creatingNewUser = false;

    if (!driftAccountExists) {
      console.log("creating new drift account");

      // If no drift account exists, create subaccount 0 and use it as the superstake account
      creatingNewUser = true;

      const [_, initializeSssAccountIx] =
        await driftClient.getInitializeUserInstructions(
          superstakeSubAccountId,
          props.lst.driftAccountName
        );

      if (superstakeSubAccountId === 0) {
        console.log("creating user stats");
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
      const superStakeAccount = commonState.userAccounts.find((account) => {
        return decodeName(account.name) === props.lst.driftAccountName;
      });

      if (superStakeAccount) {
        console.log("found super stake account");

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
        console.log("creating new superstake account");

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
          superstakeSubAccountId
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

    const jupiterClient = new JupiterClient({
      connection: commonState.connection,
    });

    let swapInstructions: TransactionInstruction[] = [];
    let lookupTables: AddressLookupTableAccount[];

    if (props.solBorrowAmount.gt(ZERO)) {
      // Add swap instructions (SOL -> LST)
      const {
        ixs: _swapInstructions,
        lookupTables: _lookupTables,
        method,
        price,
      } = await findBestSuperStakeIxs({
        jupiterClient,
        driftClient,
        amount: props.solBorrowAmount,
        userAccountPublicKey: sssAccountPublicKey,
        price: props.lstSolPrice,
        onlyDirectRoutes: true,
        marketIndex: props.lst.spotMarket.marketIndex,
      });
      console.log(`swapping using ${method} w expected price ${price}`);

      swapInstructions = _swapInstructions;
      lookupTables = _lookupTables;
    }

    const allInstructions = [...instructions, ...swapInstructions];

    const tx = await driftClient.buildTransaction(
      allInstructions,
      {
        computeUnits: 1_400_000,
      },
      0,
      // @ts-ignore
      lookupTables
    );

    // Sign, send and confirm tx here
    NOTIFICATION_UTILS.toast("Sending Transaction", {
      toastId: DEPOSIT_TOAST_ID,
    });

    // Pre-Flight safety check before sending transaction. To ENSURE we're not creating duplicate superstake acounts.
    if (creatingNewUser) {
      const currentUserAccountsForAuthority =
        await driftClient.getUserAccountsForAuthority(driftClient.authority);

      const preExistingSuperstakeAccount = currentUserAccountsForAuthority.find(
        (account) => decodeName(account.name) === props.lst.driftAccountName
      );

      invariant(
        !preExistingSuperstakeAccount,
        "Trying to create a duplicate superstake account"
      );
    }

    const { txSig: _txSig, slot: _slot } = await driftClient.sendTransaction(
      tx
    );

    await driftClient.addUser(superstakeSubAccountId, commonState.authority);

    // console.log({ _txSig, _slot });
  };

  /**
   * Outer method to handle a deposit
   *
   * @param props
   * @returns
   */
  const handleSuperStakeDeposit = async (props: DepositProps) => {
    try {
      const commonState = getCommon();
      const driftClient = commonState.driftClient.client;

      invariant(driftClient, "Drift client is undefined");

      const superStakeAccountId = await getSubaccountIdForSuperStakeAccount();

      // TODO : This logically does the correct thing but I think that I've misnamed / badly constructed this .. it's confusing being called initializeAndSubscribeToNewUserAccount when it doesn't necessarily initialize an account => Luke to refactor
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
          },
        }
      );
    } catch (err) {
      console.log(err);
      if ((err as any)?.logs) {
        console.log((err as any)?.logs);
      }

      // @ts-ignore
      NOTIFICATION_UTILS.toast.error(err.message);

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
      const activeLst = get().getActiveLst();

      const lstSpotMarket = activeLst.spotMarket;
      const solSpotMarket = (
        SpotMarkets[commonState.env.driftEnv] || SpotMarkets["mainnet-beta"]
      ).find((market) => market.symbol === "SOL");

      invariant(lstSpotMarket, "LST spot market is undefined");
      invariant(solSpotMarket, "SOL spot market is undefined");
      invariant(driftClient, "Drift client is undefined");
      invariant(commonState.authority, "Authority is undefined");
      invariant(commonState.connection, "Connection is undefined");

      driftClient.switchActiveUser(subAccountId);

      const additionalSigners: Signer[] = [];
      const withdrawInstructions: TransactionInstruction[] = [];

      let ataExists;
      const ataPublicKey = getAssociatedTokenAddressSync(
        lstSpotMarket.mint,
        commonState.authority
      );

      try {
        const accountInfo = await commonState.connection.getAccountInfo(
          ataPublicKey
        );
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
        {
          computeUnits: 1_400_000,
        },
        0
      );

      const { txSig: _txSig, slot: _slot } = await driftClient.sendTransaction(
        tx,
        additionalSigners
      );

      console.log({ _txSig, _slot });
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
      console.log('handle super stake repay borrow?');
      const commonState = getCommon();
      const driftClient = commonState.driftClient.client;
      const activeLst = get().getActiveLst();

      const lstSpotMarket = activeLst.spotMarket;
      const solSpotMarket = (
        SpotMarkets[commonState.env.driftEnv] || SpotMarkets["mainnet-beta"]
      ).find((market) => market.symbol === "SOL");

      invariant(lstSpotMarket, "LST spot market is undefined");
      invariant(solSpotMarket, "SOL spot market is undefined");
      invariant(driftClient, "Drift client is undefined");
      invariant(commonState.authority, "Authority is undefined");
      invariant(commonState.connection, "Connection is undefined");

      console.log('switching active user', subAccountId);

      driftClient.switchActiveUser(subAccountId);

      console.log('switched active user');

      const jupiterClient = new JupiterClient({
        connection: commonState.connection,
      });

      const slippageBpsToUse =
        slippageBps && !isNaN(slippageBps) && slippageBps > 0
          ? Math.floor(slippageBps)
          : SLIPPAGE_TOLERANCE_DEFAULT * 100;

      console.log('jupiterClient created', !!jupiterClient);

      const { ixs: swapInstructions, lookupTables } =
        await driftClient.getJupiterSwapIx({
          jupiterClient,
          inMarketIndex: lstSpotMarket.marketIndex,
          outMarketIndex: solSpotMarket.marketIndex,
          amount: solSwapOutAmount,
          slippageBps: slippageBpsToUse,
          swapMode: "ExactOut",
          reduceOnly: SwapReduceOnly.In,
        });

      const tx = await driftClient.buildTransaction(
        swapInstructions,
        {
          computeUnits: 1_400_000,
        },
        0,
        lookupTables
      );

      const { txSig: _txSig, slot: _slot } = await driftClient.sendTransaction(
        tx
      );

      console.log({ _txSig, _slot });
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
    const lstData = ALL_LST.find(lst => lst.symbol === newLstSymbol);

    if (!lstData) {
      throw new Error(`"No LST exists with symbol ${newLstSymbol}`);
    }

    set((state) => {
      state.activeLst = newLstSymbol;
      state.stakeUnstakeForm = {
        ...DEFAULT_STORE_STATE.stakeUnstakeForm,
        leverageToUse: lstData?.defaultLeverage ?? 2,
        unstakeLeverage: 0
      }
    });
  }

  // Resets the current subaccount / user data
  const resetCurrentUserData = (loaded?: boolean) => {
    console.log('reset current user data');
    set((s) => {
      s.superStakeUser = undefined;
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

  const switchSubaccountToActiveLst = async (currentLstPrice?: number, authorityParam?: PublicKey) => {
    console.log('switchSubaccountToActiveLst');
    let authority = authorityParam;
    if (!authority) {
      authority = getCommon().currentlyConnectedWalletContext?.publicKey;
    }
    const activeLst = get().getActiveLst();
    const driftClient = getCommon().driftClient?.client;

    if (!driftClient) {
      console.log('switchSubaccountToActiveLst drift client not exist ');
      return;
    }

    if (!authority) {
      console.log('switchSubaccountToActiveLst authority not exist ');
      return;
    }

    const userAccounts = await driftClient.getUserAccountsForAuthority(
      authority
    );

    const superStakeAccount = userAccounts.find((account) => {
      return decodeName(account.name) === activeLst.driftAccountName;
    });

    if (!superStakeAccount) {
      console.log("no super stake account found");
      resetCurrentUserData(true);
      return;
    }

    resetCurrentUserData(false);  
    await switchActiveSubaccount(superStakeAccount.subAccountId, authority);
    await updateCurrentUserData(currentLstPrice);
  }

  // Updates current user lst subaccount data in the store w/ latest data stored in memory by driftClient
  const updateCurrentUserData = async (currentLstPrice?: number) => {
    const superStakeUser = get().superStakeUser;
    if (superStakeUser) {
      const superStakeAccount = get().superStakeUser.getUserAccount();
      const activeLst = get().getActiveLst();
      const superStakeUser = get().superStakeUser

      let leverage = new BN(0);
      if (superStakeUser && currentLstPrice) {
        const lstTokenAmount = superStakeUser.getTokenAmount(
          activeLst.spotMarket.marketIndex
        );
        const solTokenAmount = superStakeUser.getTokenAmount(SOL_SPOT_MARKET_INDEX);
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
      console.log('updateCurrentUserData', superStakeUser);
    }
  }

  // Switch active subaccount in drift client without updating the store state for it
  const switchActiveSubaccount = async (subAccountId: number, authorityParam?: PublicKey) => {
    console.log('switchActiveSubaccount');
    let authority = authorityParam;
    if (!authority) {
      authority = getCommon().currentlyConnectedWalletContext?.publicKey;
    }

    if (!authority) {
      console.log('authority not set');
      return;
    }

    const driftClient = getCommon().driftClient?.client;

    if (!driftClient) {
      console.log('driftClient not exist')
      return;
    }

    await driftClient.switchActiveUser(
      subAccountId,
      authority
    );

    await driftClient.addUser(subAccountId, authority);

    set(s => {
      s.superStakeUser = driftClient.getUser();
    });
  }


  return {
    handleSuperStakeDeposit,
    handleSuperStakeWithdrawal,
    handleSuperStakeRepayBorrow,
    resetCurrentUserData,
    switchActiveLst,
    switchActiveSubaccount,
    switchSubaccountToActiveLst,
    updateCurrentUserData
  };
};

export default createAppActions;
