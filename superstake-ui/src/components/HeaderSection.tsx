import Text from './Text';
import ConnectWalletButton from './ConnectWalletButton';
import React from 'react';
import useAppStore from '../hooks/useAppStore';
import { useCurrentRpcLatency } from '../hooks/useRpcLatencies';
import { getRpcLatencyColor } from '../utils/uiUtils';
import { useCurrentRpc } from '@drift-labs/react';
import { twMerge } from 'tailwind-merge';
import SkeletonValuePlaceholder from './SkeletonValuePlaceholder';

const HeaderSection = () => {
	const setStore = useAppStore((s) => s.set);
	const [currentRpc] = useCurrentRpc();
	const rpcLatency = useCurrentRpcLatency();
	const rpcLatencyBgColor = getRpcLatencyColor(rpcLatency?.avg);

	const openRpcSwitcherModal = () => {
		setStore((s) => {
			s.modals.showRpcSwitcherModal = true;
		});
	};

	const openPriorityFeesModal = () => {
		setStore((s) => {
			s.modals.showPriorityFeesModal = true;
		});
	};

	return (
		<div className="flex flex-col items-center w-full pt-8 pb-2 md:px-8 md:flex-row space-between">
			<div className="flex items-end flex-grow gap-8 -mt-2 text-center md:text-left">
				<div className="relative hidden lg:block top-1">
					<img src="/logo.svg" alt="logo" className="h-24" />
				</div>
				<div className="flex flex-col">
					<Text.H1 className="md:text-5xl lg:text-6xl md:relative md:top-3">
						super stake sol
					</Text.H1>
					<Text.H6 className="font-normal">
						Earn leveraged yield on your SOL staking tokens
					</Text.H6>
				</div>
			</div>
			<div className="flex flex-col items-center w-full mt-5 md:items-end md:mt-0 md:w-auto">
				<div className="w-full mt-1 mb-4 md:w-auto md:relative md:top-3">
					<ConnectWalletButton />
				</div>

				<div className="flex items-center justify-center w-full px-4 py-2 leading-4 border-2 divide-x rounded-sm bg-container-bg border-container-border divide-container-border md:w-auto whitespace-nowrap">
					<Text.BODY1
						onClick={openRpcSwitcherModal}
						className="cursor-pointer md:pr-3 lg:pr-6"
					>
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

					<Text.BODY1
						className="hidden cursor-pointer md:pl-3 lg:pl-6 md:block"
						onClick={openPriorityFeesModal}
					>
						Priority Fees: Dynamic
					</Text.BODY1>
				</div>

				{/** Purely for UI purposes to split the priority fees into 2 child components */}
				<div
					className="flex items-center justify-center w-full px-4 py-2 mt-4 leading-4 border-2 rounded-sm cursor-pointer md:hidden bg-container-bg border-container-border"
					onClick={openPriorityFeesModal}
				>
					<Text.BODY1 className="md:pl-3 lg:pl-6">
						Priority Fees: Dynamic
					</Text.BODY1>
				</div>
			</div>
		</div>
	);
};

export default React.memo(HeaderSection);
