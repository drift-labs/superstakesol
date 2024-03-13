import { useState } from 'react';
import useAppStore from '../hooks/useAppStore';
import { Modal, ModalTitle } from './Modal';
import Text from './Text';
import Button from './Button';
import { CollateralInput } from './CollateralInput';
import {
	usePriorityFeeStore,
	FeeType,
	usePriorityFeeUserSettings,
	useOraclePriceStore,
} from '@drift-labs/react';
import { MarketId } from '@drift/common';
import NOTIFICATION_UTILS from '../utils/notify';
import { useImmediateInterval } from '@drift-labs/react';
import { SOL_SPOT_MARKET_INDEX } from '../utils/uiUtils';
import { SSS_TRANSACTION_COMPUTE_UNITS_LIMIT } from '../constants/environment';

const PRIORITY_FEES_OPTIONS: {
	label: string;
	subValue: string | undefined;
	value: FeeType;
}[] = [
	{
		label: 'Dynamic',
		subValue: undefined,
		value: 'dynamic',
	},
	{
		label: 'Boosted',
		subValue: '5x',
		value: 'boosted',
	},
	{
		label: 'Boosted',
		subValue: '10x',
		value: 'turbo',
	},
	{
		label: 'Custom',
		subValue: undefined,
		value: 'custom',
	},
];

const SOL_MARKET_ID = MarketId.createSpotMarket(SOL_SPOT_MARKET_INDEX);

const PriorityFeesModal = () => {
	const setStore = useAppStore((s) => s.set);
	const getMarketPriceData = useOraclePriceStore((s) => s.getMarketPriceData);
	const getPriorityFeeToUse = usePriorityFeeStore((s) => s.getPriorityFeeToUse);
	const { priorityFeeSettings, setPriorityFeeSettings } =
		usePriorityFeeUserSettings();

	const [selectedPriorityFeeOption, setSelectedPriorityFeeOption] = useState(
		priorityFeeSettings.userPriorityFeeType
	);
	const [maxFee, setMaxFee] = useState(
		priorityFeeSettings.userCustomMaxPriorityFeeCap.toString()
	);
	const [customPriorityFee, setCustomPriorityFee] = useState(
		priorityFeeSettings.userCustomPriorityFee?.toString() ?? ''
	);
	const [dynamicPriorityFee, setDynamicPriorityFee] = useState('');

	useImmediateInterval(() => {
		setDynamicPriorityFee(
			getPriorityFeeToUse(
				SSS_TRANSACTION_COMPUTE_UNITS_LIMIT,
				selectedPriorityFeeOption
			).priorityFeeInSol.toString()
		);
	}, 1000);

	function getSolPrice() {
		const solPrice = getMarketPriceData(SOL_MARKET_ID)?.priceData.price ?? 0;
		return solPrice;
	}

	function getUsdPrice(solValue: number) {
		const solPrice = getSolPrice();
		const usdPrice = solPrice * solValue;

		if (usdPrice < 0.01) return '<$0.01';

		return `$${usdPrice.toFixed(2)}`;
	}

	const onClose = () => {
		setStore((s) => {
			s.modals.showPriorityFeesModal = false;
		});
	};

	const onSave = () => {
		setPriorityFeeSettings({
			userPriorityFeeType: selectedPriorityFeeOption,
			userCustomMaxPriorityFeeCap: +maxFee,
			userCustomPriorityFee:
				selectedPriorityFeeOption === 'custom' ? +customPriorityFee : null,
		});

		NOTIFICATION_UTILS.toast.success('Priority fees settings saved', {
			autoClose: 5000,
		});

		onClose();
	};

	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col items-center w-full h-full">
				<ModalTitle
					title="Priority fees"
					center
					className="px-2 mb-6 md:mb-12"
				/>

				<div className="max-w-full md:max-w-[800px] px-2 overflow-y-auto md:px-0">
					<div className="flex flex-col gap-4 text-left md:gap-8 md:text-center">
						<Text.BODY2 className="text-sm font-medium md:text-base">
							An extra fee added to your transactions to encourage Solana
							validators to process your transactions faster. Set a cap to
							prevent overpaying.
						</Text.BODY2>

						<div className="grid w-full grid-cols-2 gap-4 md:gap-7 md:grid-cols-4">
							{PRIORITY_FEES_OPTIONS.map((option) => (
								<Button
									className="flex flex-col gap-2 px-6 md:px-6 md:w-[170px] h-[90px] md:h-[100px] pt-3 md:pt-4 pb-2 md:pb-3 w-full"
									outerClassName="w-full md:w-[170px]"
									selected={option.value === selectedPriorityFeeOption}
									onClick={() => setSelectedPriorityFeeOption(option.value)}
									key={option.value}
								>
									<Text.H6 className="font-bold">{option.label}</Text.H6>
									{option.subValue && (
										<Text.H6 className="font-bold">{option.subValue}</Text.H6>
									)}
								</Button>
							))}
						</div>

						<Text.BODY2 className="text-sm font-medium md:text-base">
							Automatically adjusts, targeting the 75th percentile of fees in
							the last 10 blocks.
						</Text.BODY2>

						{selectedPriorityFeeOption !== 'custom' && (
							<div className="flex flex-col items-center gap-8 md:flex-row">
								<CollateralInput
									label="Est. Fee"
									inputClassName="text-lg md:text-2xl font-semibold py-2"
									value={dynamicPriorityFee}
									rightLabel={
										<Text.BODY3 className="text-base md:text-lg text-text-label">
											~{getUsdPrice(+dynamicPriorityFee)}
										</Text.BODY3>
									}
									disabled
									lstSymbol="SOL"
									onChange={() => {}}
								/>
								<CollateralInput
									label="Max Fee Cap"
									inputClassName="text-lg md:text-2xl font-semibold py-2"
									value={maxFee}
									lstSymbol="SOL"
									onChange={setMaxFee}
									rightLabel={
										<Text.BODY3 className="text-base md:text-lg text-text-label">
											~{getUsdPrice(+maxFee)}
										</Text.BODY3>
									}
								/>
							</div>
						)}

						{selectedPriorityFeeOption === 'custom' && (
							<div className="flex flex-col items-center gap-8 md:flex-row">
								<CollateralInput
									label="Custom Fee"
									inputClassName="text-lg md:text-2xl font-semibold py-2"
									value={customPriorityFee}
									lstSymbol="SOL"
									onChange={setCustomPriorityFee}
									bottomLeftContent={
										<Text.H6 className="text-sm font-medium">
											Max fee is 1 SOL.
										</Text.H6>
									}
									rightLabel={
										<Text.BODY3 className="text-base md:text-lg text-text-label">
											~{getUsdPrice(+customPriorityFee)}
										</Text.BODY3>
									}
								/>
							</div>
						)}
					</div>

					<div className="flex items-center justify-center gap-4 mt-4 text-base md:gap-6 md:text-xl md:mt-16">
						<Button
							className="py-4 md:py-5 md:px-20 text-text-negative-red md:w-[252px] w-full"
							outerClassName="md:w-[252px]"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							className="py-4 md:py-5 md:px-20 md:w-[252px] w-full"
							outerClassName="md:w-[252px]"
							onClick={onSave}
						>
							Save
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default PriorityFeesModal;
