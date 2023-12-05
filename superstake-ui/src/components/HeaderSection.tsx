import Text from './Text';
import Link from 'next/link';
import ConnectWalletButton from './ConnectWalletButton';
import React from 'react';
import useAppStore from '../hooks/useAppStore';

const HeaderSection = () => {
	const set = useAppStore((s) => s.set);

	const openTermsModal = () => {
		set((s) => {
			s.modals.showTermsAndConditionModal = {
				show: true,
				isFromAcknowledgeModal: false,
			};
		});
	};

	return (
		<div className="flex flex-col items-center w-full pt-8 pb-2 md:px-8 md:flex-row space-between">
			<div className="flex items-end flex-grow gap-8 -mt-2 text-center md:text-left">
				<div className="relative hidden lg:block top-1">
					<img src="/logo.svg" alt="logo" className="h-24" />
				</div>
				<div className="flex flex-col">
					<Text.H1 className="md:relative md:top-3">super stake sol</Text.H1>
					<Text.H6 className="font-normal">
						Earn leveraged yield on your SOL staking tokens
					</Text.H6>
				</div>
			</div>
			<div className="flex flex-col items-center w-full mt-5 md:items-end md:mt-0 md:w-auto">
				<div className="w-full mt-1 mb-4 md:w-auto md:relative md:top-3">
					<ConnectWalletButton />
				</div>
				<div className="flex flex-row items-center mt-2 divide-x-2 space-between divide-container-border md:divide-white md:text-white">
					<div className="px-5">
						<Link
							href={
								'https://superstakesol.notion.site/superstakesol/super-stake-sol-FAQ-0cab21138d1d46958fe91c7768b6fc88'
							}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Text.BODY3>FAQ</Text.BODY3>
						</Link>
					</div>
					<div className="px-5 cursor-pointer" onClick={openTermsModal}>
						<Text.BODY3>Terms</Text.BODY3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default React.memo(HeaderSection);
