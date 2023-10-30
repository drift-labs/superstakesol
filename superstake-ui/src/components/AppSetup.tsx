import useIdlePollingRateSwitcher from "../hooks/useIdlePollingRateSwitcher";
import useEventsRecords from "../hooks/useEventRecords";
import useSyncMSolMetrics from "../hooks/useSyncMSolMetrics";
import { PropsWithChildren, useEffect } from "react";
import useCurrentUserData from "../hooks/useCurrentUserData";
import useSpotMarketData from "../hooks/useSpotMarketData";
import useEmulation from "../hooks/useEmulation";
import { useSyncWalletToStore } from "../hooks/useSyncWalletToStore";
import { useShowTermsModal } from "../hooks/useLastAcknowledgedTerms";
import useInitPostHogUser from "../hooks/useInitPosthogUser";
import useJitoSolMetrics from "../hooks/useJitoSolMetrics";
import useAppStore from "../hooks/useAppStore";
import useDuplicateAccountWarning from "../hooks/useDuplicateAccountWarning";

const AppSetup = (props: PropsWithChildren) => {
  const getAppStore = useAppStore((s) => s.get);

  useEffect(() => {
    // @ts-ignore
    window.drift_dev_app = { get: getAppStore };
  }, []);

  useInitPostHogUser();
  useSyncWalletToStore();
  useIdlePollingRateSwitcher(); // custom hook because it uses useCustomDriftClientIsReady
  useCurrentUserData();
  useSyncMSolMetrics();
  useJitoSolMetrics();
  useEventsRecords();
  useSpotMarketData();
  useShowTermsModal();
  useEmulation(); // custom hook because it uses useCustomDriftClientIsReady
  useDuplicateAccountWarning();

  return <>{props.children}</>;
};

export default AppSetup;
