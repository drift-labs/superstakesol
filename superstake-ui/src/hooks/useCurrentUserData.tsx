"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAppActions } from "./useAppActions";

const useCurrentUserData = () => {
  const activeLst = useAppStore(s => s.activeLst);
  const superStakeUser = useAppStore(s => s.superStakeUser);
  const actions = useAppActions();
  const driftClientIsReady = useCustomDriftClientIsReady();
  const { connected } = useWallet();
  const appAuthority = useCommonDriftStore((s) => s.authority);
  const lstMetrics = useCurrentLstMetrics();

  // Just like in drift main ui this should prob be stringified in the common store
  const appAuthorityString = useMemo(() => {
    return appAuthority ? appAuthority.toString() : ''
  }, [appAuthority]);

  // Initially switch to superstake user account when drift client is ready and metrics are loaded
  useEffect(() => {
    if (connected && driftClientIsReady && appAuthorityString && lstMetrics.loaded) {
      console.log({
        connected,
        driftClientIsReady,
        appAuthorityString,
        'lstMetrics.loaded': lstMetrics.loaded,
        activeLst
      })
      console.log('useCurrentUserData switching to active lst');
      actions.switchSubaccountToActiveLst(lstMetrics.priceInSol);
    }  else if ((!connected || !appAuthority) && superStakeUser) {
      console.log('useCurrentUserData resetting user data on disconnect');
      actions.resetCurrentUserData();
    }
  }, [connected, driftClientIsReady, appAuthorityString, lstMetrics.loaded, activeLst]);

  // useEffect(() => {
  //   if (lstMetrics.loaded && ) {
  //   }
  // }, [lstMetrics.loaded]);

  // useEffect(() => {
  //   if (!superStakeUser) {
  //     return;
  //   }

  //   const listenerClosingCallback = () => {
  //     if (!superStakeUser) {
  //       actions.resetCurrentUserData(true);
  //       return;
  //     }

  //     const updateHandler = () => {
  //       console.log('superstake user update handler?');
  //       actions.updateCurrentUserData(lstMetrics.priceInSol);
  //     }

  //     superStakeUser.eventEmitter.on("userAccountUpdate", updateHandler);

  //     return () => {
  //       superStakeUser.eventEmitter.removeListener(
  //         "userAccountUpdate",
  //         updateHandler
  //       );
  //     };
  //   };

  //   return listenerClosingCallback();
  // }, [superStakeUser]);
};

export default useCurrentUserData;
