'use client';

// Force dynamic rendering at the page level
export const dynamic = 'force-dynamic';

import FloatingUI from '../components/FloatingUI';
import HeaderSection from '../components/HeaderSection';
import StatusBar from '../components/StatusBar';
import StyledToastContainer from '../components/StyledToastContainer';
import VaultPageContent from '../components/VaultPage/VaultPageContent';

export default function Home() {
	return (
		<>
			<HeaderSection />
			<VaultPageContent />
			<StatusBar />
			<FloatingUI />
			<StyledToastContainer />
		</>
	);
}
