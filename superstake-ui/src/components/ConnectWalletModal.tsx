import useAppStore from '../hooks/useAppStore';
import { Wallet, WalletReadyState, useWallet } from '@drift-labs/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Button from './Button';
import { Modal, ModalTitle } from './Modal';
import Text from './Text';

const ConnectWalletModal = () => {
	const [shouldShowModal, setShouldShowModal] = useState(true);
	const setAppStore = useAppStore((s) => s.set);
	const walletContext = useWallet();
	const currentWallet = walletContext?.wallet;

	const handleConnect = (wallet: Wallet) => {
		walletContext?.select(wallet.adapter.name);
		wallet.adapter.connect();
	};

	const handleClose = () => {
		setAppStore((s) => {
			s.modals.showConnectWalletModal = false;
		});
	};

	useEffect(() => {
		if (walletContext?.connected) {
			setShouldShowModal(false);
		}
	}, [walletContext?.connected]);

	return (
		<Modal onClose={handleClose} visible={shouldShowModal}>
			<div className="h-full flex flex-col items-center max-w-[480px] m-auto pb-12">
				<ModalTitle title={'Connect Wallet'} />
				<div className="w-full px-4 space-y-6 overflow-y-auto">
					{walletContext?.wallets?.map((wallet) => {
						return (
							<Button
								key={wallet.adapter.name}
								onClick={() => handleConnect(wallet)}
								className="w-full px-6"
								disabled={currentWallet?.adapter?.connecting}
								selected={wallet.adapter.connected}
							>
								<div className="flex flex-row items-center justify-between">
									<div className="flex flex-row items-center space-x-5">
										<Image
											alt={`${wallet.adapter.name} icon`}
											src={wallet.adapter.icon}
											width={32}
											height={32}
											className={
												wallet.adapter.name === 'MathWallet'
													? 'bg-black rounded'
													: ''
											}
										/>
										<Text.H5>{wallet.adapter.name}</Text.H5>
									</div>
									{wallet.adapter.connected ? (
										<div>Connected</div>
									) : wallet.adapter.readyState ===
									  WalletReadyState.Installed ? (
										<div>Detected</div>
									) : (
										<></>
									)}
								</div>
							</Button>
						);
					})}
				</div>
			</div>
		</Modal>
	);
};

export default React.memo(ConnectWalletModal);
