import useAppStore from "./useAppStore";
import useLastAcknowledgedTerms, {
  checkLastAcknowledgedTermsValidity,
} from "./useLastAcknowledgedTerms";
import { useEffect, useRef } from "react";
import NOTIFICATION_UTILS from "../utils/notify";
import { useCommonDriftStore } from "@drift-labs/react";
import { useWallet } from "@drift-labs/react";

export const useWalletAutoConnect = () => {
  const { canWalletConnect } = useWalletConnectCheck();
  const walletContext = useWallet();
  const prevConnectedStateRef = useRef(false);

  useEffect(() => {
    if (canWalletConnect) {
      if (prevConnectedStateRef.current && !walletContext?.connected) {
        // user just disconnected and so should not immediately auto connect
        prevConnectedStateRef.current = !!walletContext?.connected;
        return;
      }

      if (!walletContext?.connected && walletContext?.wallet?.adapter.name) {
        walletContext?.connect();
      }
    }

    prevConnectedStateRef.current = !!walletContext?.connected;
  }, [walletContext?.connected, canWalletConnect]);
};

export const useWalletConnectCheck = () => {
  const isGeoBlocked = useCommonDriftStore((s) => s.isGeoBlocked);
  const { lastAcknowledgedTerms } = useLastAcknowledgedTerms();
  const setAppStore = useAppStore((s) => s.set);

  const canWalletConnect =
    !isGeoBlocked &&
    isGeoBlocked !== undefined &&
    checkLastAcknowledgedTermsValidity(lastAcknowledgedTerms);

  const followUpAction = () => {
    if (isGeoBlocked) {
      NOTIFICATION_UTILS.toast.error(
        "You are not allowed to use Super Stake Sol from a restricted territory."
      );
    } else if (!checkLastAcknowledgedTermsValidity(lastAcknowledgedTerms)) {
      setAppStore((s) => {
        s.modals.showAcknowledgeTermsModal = true;
      });
    }
  };

  return { canWalletConnect, followUpAction };
};
