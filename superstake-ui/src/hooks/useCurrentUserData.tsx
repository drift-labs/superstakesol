"use client";

import { useEffect, useState } from "react";
import useCustomDriftClientIsReady from "./useCustomDriftClientIsReady";
import useAppStore, { DEFAULT_USER_DATA } from "./useAppStore";
import { decodeName } from "../utils/uiUtils";
import {
  BigNum,
  BN,
  FOUR,
  LAMPORTS_PRECISION,
  PublicKey,
  TEN_THOUSAND,
  User,
  ZERO,
} from "@drift-labs/sdk";
import { SOL_SPOT_MARKET_INDEX } from "../utils/uiUtils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCommonDriftStore } from "@drift-labs/react";
import { useWallet } from "@drift-labs/react";
import useCurrentLstMetrics from "./useCurrentLstMetrics";

const useCurrentUserData = () => {
  const setStore = useAppStore((s) => s.set);
  const setCommonStore = useCommonDriftStore(s => s.set);
  const driftClient = useCommonDriftStore((s) => s.driftClient.client);
  const driftClientIsReady = useCustomDriftClientIsReady();
  const { connected } = useWallet();
  const appAuthority = useCommonDriftStore((s) => s.authority);
  const lstMetrics = useCurrentLstMetrics();
  const activeLst = useAppStore((s) => s.getActiveLst());

  const [superStakeUser, setSuperStakeUser] = useState<User>();

  const resetCurrentUserData = (loaded?: boolean) => {
    console.log('resetCurrentUserData');
    setStore((s) => {
      s.currentUserAccount = { ...DEFAULT_USER_DATA, loaded: !!loaded };
      s.eventRecords = {
        depositRecords: [],
        swapRecords: [],
        mostRecentTx: undefined,
        loaded: !!loaded,
      };
    });
    setCommonStore((s) => {
      s.userAccounts = [];
    });
  };

  const getAndSetCurrentUserData = async (authority: PublicKey) => {
    if (driftClient) {
      console.log('getAndSetCurrentUserData');
      const userAccounts = await driftClient.getUserAccountsForAuthority(
        authority
      );

      console.log('userAccounts', userAccounts);

      const superStakeAccount = userAccounts.find((account) => {
        return decodeName(account.name) === activeLst.driftAccountName;
      });

      if (!superStakeAccount) {
        console.log("no super stake account found");
        resetCurrentUserData(true);
        return;
      }

      if (superStakeAccount && authority) {
        console.log("switching to sss account");
        await driftClient.switchActiveUser(
          superStakeAccount?.subAccountId,
          authority
        );
      }

      let driftUser: User | undefined;
      try {
        await driftClient.addUser(superStakeAccount?.subAccountId, authority);

        driftUser = driftClient.getUser(
          superStakeAccount?.subAccountId,
          authority
        );


        setSuperStakeUser(superStakeUser);
      } catch (err) {
        console.log(err);
      }

      let leverage = new BN(0);
      if (driftUser && lstMetrics.loaded) {
        const lstTokenAmount = driftUser.getTokenAmount(
          activeLst.spotMarket.marketIndex
        );
        const solTokenAmount = driftUser.getTokenAmount(SOL_SPOT_MARKET_INDEX);
        if (solTokenAmount.lt(ZERO)) {
          const lstRatioBN = new BN(lstMetrics.priceInSol * LAMPORTS_PER_SOL);
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

      setStore((s) => {
        s.currentUserAccount = {
          user: driftUser,
          userAccount: superStakeAccount,
          leverage: BigNum.from(leverage ?? 0, FOUR).toNum(),
          spotPositions: superStakeAccount?.spotPositions || [],
          accountId: superStakeAccount?.subAccountId,
          loaded: true,
        };
      });

      setCommonStore((s) => {
        s.userAccounts = userAccounts;
      });
    }
  };

  useEffect(() => {
    if (connected && driftClientIsReady && appAuthority) {
      getAndSetCurrentUserData(appAuthority);
    }  else if (!connected || !appAuthority) {
      resetCurrentUserData();
    }
  }, [connected, driftClientIsReady, appAuthority, activeLst]);

  useEffect(() => {
    if (!superStakeUser) {
      return;
    }

    const listenerClosingCallback = () => {
      if (!superStakeUser) {
        resetCurrentUserData(true);
        return;
      }

      const updateHandler = () =>
        getAndSetCurrentUserData(superStakeUser.getUserAccount().authority);

      superStakeUser.eventEmitter.on("userAccountUpdate", updateHandler);

      return () => {
        superStakeUser.eventEmitter.removeListener(
          "userAccountUpdate",
          updateHandler
        );
      };
    };

    return listenerClosingCallback();
  }, [superStakeUser]);
};

export default useCurrentUserData;
