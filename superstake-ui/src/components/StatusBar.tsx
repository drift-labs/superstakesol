import useAppStore from '../hooks/useAppStore';
import Text from './Text';

const StatusBar = () => {
	const setStore = useAppStore((s) => s.set);

	const openTermsModal = () => {
		setStore((s) => {
			s.modals.showTermsAndConditionModal = {
				show: true,
				isFromAcknowledgeModal: false,
			};
		});
	};

	return (
		<div className="flex flex-row items-center justify-center w-full mt-8">
			<Text.BODY1 className="flex items-center justify-center w-full border-2 rounded-sm md:w-auto bg-container-bg border-container-border divide-x divide-container-border py-2 [&>a]:px-6 leading-4">
				<a
					href="https://superstakesol.notion.site/superstakesol/super-stake-sol-FAQ-0cab21138d1d46958fe91c7768b6fc88"
					target="_blank"
					rel="noreferrer"
				>
					FAQ
				</a>
				<a onClick={openTermsModal} className="cursor-pointer">
					Terms
				</a>
				<a href="https://app.drift.trade/" target="_blank" rel="noreferrer">
					Powered by Drift
				</a>
			</Text.BODY1>
		</div>
	);
};

export default StatusBar;
