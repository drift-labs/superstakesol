'use client';

import DebugPanel from '../components/DebugPanel/DebugPanel';
import FloatingUI from '../components/FloatingUI';
import HeaderSection from '../components/HeaderSection';
import StatusBar from '../components/StatusBar';
import StyledToastContainer from '../components/StyledToastContainer';
import VaultPageContent from '../components/VaultPage/VaultPageContent';
import Env from '../constants/environment';

export default function Home() {
	return (
		<>
			<HeaderSection />
			<VaultPageContent />
			<StatusBar />
			<FloatingUI />
			<StyledToastContainer />
			{Env.isDev && <DebugPanel />}
		</>
	);
}
