import useAppStore from '../hooks/useAppStore';
import React from 'react';
import ConnectWalletModal from './ConnectWalletModal';
import AcknowledgeTermsModal from './AcknowledgeTermsModal';
import TermsAndConditionModal from './TermsAndConditionModal';
import RpcSwitcherModal from './RpcSwitcherModal';
import PriorityFeesModal from './PriorityFeesModal';

const FloatingUI = () => {
	// # Constants
	const {
		showConnectWalletModal,
		showAcknowledgeTermsModal,
		showTermsAndConditionModal,
		showRpcSwitcherModal,
		showPriorityFeesModal,
	} = useAppStore((s) => s.modals);

	return (
		<>
			{showConnectWalletModal ? (
				<ConnectWalletModal />
			) : showAcknowledgeTermsModal ? (
				<AcknowledgeTermsModal />
			) : showTermsAndConditionModal.show ? (
				<TermsAndConditionModal />
			) : showRpcSwitcherModal ? (
				<RpcSwitcherModal />
			) : showPriorityFeesModal ? (
				<PriorityFeesModal />
			) : (
				<></>
			)}
		</>
	);
};

export default React.memo(FloatingUI);
