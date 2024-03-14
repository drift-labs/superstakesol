import useEventsRecords from '../hooks/useEventRecords';
import useSyncMSolMetrics from '../hooks/useSyncMSolMetrics';
import { PropsWithChildren, useEffect } from 'react';
import useCurrentUserData from '../hooks/useCurrentUserData';
import useSpotMarketData from '../hooks/useSpotMarketData';
import { useSyncWalletToStore } from '../hooks/useSyncWalletToStore';
import { useShowTermsModal } from '../hooks/useLastAcknowledgedTerms';
import useInitPostHogUser from '../hooks/useInitPosthogUser';
import useJitoSolMetrics from '../hooks/useJitoSolMetrics';
import useAppStore from '../hooks/useAppStore';
import useDuplicateAccountWarning from '../hooks/useDuplicateAccountWarning';
import {
	MarketAndAccount,
	useCommonDriftStore,
	usePriorityFeeUserSettings,
	useSyncOraclePriceStore,
	useSyncPriorityFeeStore,
} from '@drift-labs/react';
import { ALL_LST } from '../constants/lst';
import { SOL_SPOT_MARKET_INDEX } from '../utils/uiUtils';
import Env, { RPC_LIST } from '../constants/environment';
import { UIMarket, Config as CommonConfig } from '@drift/common';

const marketAndAccounts: MarketAndAccount[] = [
	{
		market: UIMarket.createSpotMarket(SOL_SPOT_MARKET_INDEX),
		accountToUse: CommonConfig.spotMarketsLookup[SOL_SPOT_MARKET_INDEX].oracle,
	},
];

const AppSetup = (props: PropsWithChildren) => {
	const getAppStore = useAppStore((s) => s.get);
	const setCommonDriftStore = useCommonDriftStore((s) => s.set);
	const getCommonDriftStore = useCommonDriftStore((s) => s.get);

	// variables for useSyncPriorityFeeStore
	const heliusRpcUrl =
		RPC_LIST.find((rpc) => rpc.value.includes('helius'))?.value ?? '';
	const targetFeePercentile = Env.priorityFee.targetPercentile;
	const { priorityFeeSettings } = usePriorityFeeUserSettings();

	// Set up custom driftClientIsReady function
	useEffect(() => {
		setCommonDriftStore((s) => {
			const customDriftClientIsReady = () => {
				const driftClient = getCommonDriftStore().driftClient;

				const areLstSpotMarketAccountsReady = ALL_LST.reduce((acc, lst) => {
					return (
						acc &&
						driftClient.client?.accountSubscriber.getSpotMarketAccountAndSlot(
							lst.spotMarket.marketIndex
						) !== undefined
					);
				}, true);

				return (
					driftClient.client &&
					driftClient.client.isSubscribed &&
					driftClient.isSubscribed &&
					driftClient.client.accountSubscriber.getSpotMarketAccountAndSlot(
						SOL_SPOT_MARKET_INDEX
					) !== undefined &&
					areLstSpotMarketAccountsReady
				);
			};

			s.checkIsDriftClientReady = customDriftClientIsReady;
		});
	}, [setCommonDriftStore]);

	useEffect(() => {
		// @ts-ignore
		window.drift_dev_app = { get: getAppStore };
	}, []);

	useInitPostHogUser();
	useSyncWalletToStore();
	useCurrentUserData();
	useSyncMSolMetrics();
	useJitoSolMetrics();
	useEventsRecords();
	useSpotMarketData();
	useShowTermsModal();
	useDuplicateAccountWarning();
	useSyncPriorityFeeStore({
		heliusRpcUrl,
		targetFeePercentile,
		userPriorityFeeType: priorityFeeSettings.userPriorityFeeType,
		userCustomMaxPriorityFeeCap:
			priorityFeeSettings.userCustomMaxPriorityFeeCap,
		userCustomPriorityFee: priorityFeeSettings.userCustomPriorityFee,
	});
	useSyncOraclePriceStore(marketAndAccounts);

	return <>{props.children}</>;
};

export default AppSetup;
