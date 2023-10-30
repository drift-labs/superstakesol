import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { useInterval } from 'react-use';
import { useCommonDriftStore } from '@drift-labs/react';

const DEFAULT_STATE = {
	absoluteSlot: 0,
	slotIndex: 0,
	slotsInEpoch: 0,
	slotProgress: 0,
	avgSlotTimeMs: 0,
	estimatedTimeRemainingInEpochMs: 0,
	avgSlotTimeLoaded: false,
};

const useEpochInfo = () => {
	const connection = useCommonDriftStore((s) => s.connection);
	const [epochInfo, setEpochInfo] = useState(DEFAULT_STATE);

	const getAndSetEpochInfo = async () => {
		if (!connection) return;

		const epochInfoResponse = await connection.getEpochInfo();

		// This won't match solana explorer perfectly unless it's a large value (i.e. the max, 720) but the higher the value, the slower it is
		const perfSamples = await connection.getRecentPerformanceSamples(360);

		const avgSlotTimeMs =
			perfSamples.reduce(
				(sum, sample) =>
					(sum += (sample.samplePeriodSecs / sample.numSlots) * 1000),
				0
			) / perfSamples.length;

		const estimatedTimeRemainingInEpochMs =
			(epochInfoResponse.slotsInEpoch - epochInfoResponse.slotIndex) *
			avgSlotTimeMs;

		setEpochInfo({
			absoluteSlot: epochInfoResponse.absoluteSlot,
			slotIndex: epochInfoResponse.slotIndex,
			slotsInEpoch: epochInfoResponse.slotsInEpoch,
			slotProgress:
				epochInfoResponse.slotIndex / epochInfoResponse.slotsInEpoch,
			avgSlotTimeMs,
			estimatedTimeRemainingInEpochMs,
			avgSlotTimeLoaded: true,
		});
	};

	// This probably doesn't need to update often, if at all?
	useInterval(getAndSetEpochInfo, 10000);

	return epochInfo;
};

export default singletonHook(DEFAULT_STATE, useEpochInfo);
