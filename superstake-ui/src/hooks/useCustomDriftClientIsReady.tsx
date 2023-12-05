import { ALL_LST } from '../constants/lst';
import { SOL_SPOT_MARKET_INDEX } from '../utils/uiUtils';
import { useCommonDriftStore } from '@drift-labs/react';

const useCustomDriftClientIsReady = () => {
	const driftClientIsReady = useCommonDriftStore((s) => {
		const areLstSpotMarketAccountsReady = ALL_LST.reduce((acc, lst) => {
			return (
				acc &&
				s.driftClient.client?.accountSubscriber.getSpotMarketAccountAndSlot(
					lst.spotMarket.marketIndex
				) !== undefined
			);
		}, true);

		return (
			s.driftClient.client &&
			s.driftClient.client.isSubscribed &&
			s.driftClient.isSubscribed &&
			s.driftClient.client.accountSubscriber.getSpotMarketAccountAndSlot(
				SOL_SPOT_MARKET_INDEX
			) !== undefined &&
			areLstSpotMarketAccountsReady
		);
	});

	return driftClientIsReady;
};

export default useCustomDriftClientIsReady;
