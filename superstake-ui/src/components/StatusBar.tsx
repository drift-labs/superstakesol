import useAppStore from '../hooks/useAppStore';
import SkeletonValuePlaceholder from './SkeletonValuePlaceholder';
import Text from './Text';
import { useCurrentRpcLatency } from '../hooks/useRpcLatencies';
import { twMerge } from 'tailwind-merge';
import { getRpcLatencyColor } from '../utils/uiUtils';
import { useCurrentRpc } from '@drift-labs/react';

const StatusBar = () => {
	const setStore = useAppStore((s) => s.set);
	const [currentRpc] = useCurrentRpc();
	const rpcLatency = useCurrentRpcLatency();

	const rpcLatencyBgColor = getRpcLatencyColor(rpcLatency?.avg);

	const openRpcSwitcherModal = () => {
		setStore((s) => {
			s.modals.showRpcSwitcherModal = true;
		});
	};

	return (
		<div className="flex flex-row items-center justify-center w-full mt-8">
			<div className="flex flex-col items-center justify-center w-full py-4 space-y-4 border-2 rounded-sm md:w-auto md:flex-row bg-container-bg border-container-border md:space-y-0 md:divide-x divide-container-border md:py-2">
				<div
					className="px-6 cursor-pointer min-w-[190px] text-center"
					onClick={openRpcSwitcherModal}
				>
					<Text.BODY1>
						{currentRpc ? (
							<>
								<div
									className={twMerge(
										'rounded w-3 h-3 inline-block relative mr-3',
										`bg-[${rpcLatencyBgColor}]`
									)}
								/>
								{currentRpc?.label}{' '}
								{rpcLatency ? <>({rpcLatency?.avg}ms)</> : null}
							</>
						) : (
							<SkeletonValuePlaceholder
								loading
								className="w-20 h-4 relative top-0.5 inline-block"
							/>
						)}
					</Text.BODY1>
				</div>
				<div className="px-6">
					<Text.BODY1>
						<a href="https://drift.trade/" target="_blank" rel="noreferrer">
							Powered by Drift
						</a>
					</Text.BODY1>
				</div>
			</div>
		</div>
	);
};

export default StatusBar;
