import React, { useState } from 'react';
import 'rc-slider/assets/index.css';
import Chevron from './Chevron';
import Button from './Button';
import Text from './Text';
import { twMerge } from 'tailwind-merge';

type SlippageInputProps = {
	onChange: (val?: string) => void;
	value?: string;
	disabled?: boolean;
	placeholder?: string;
	maxLoading?: boolean;
	className?: string;
	selected?: boolean;
};

const SlippageInput = (props: SlippageInputProps) => {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	const isCustomValue =
		props.value !== '0.1' && props.value !== '0.5' && props.value !== '1';

	const handleBlur = () => {
		// Filter out excess dots, e.g. "2.31.3 or .23."
		const val = inputRef?.current?.value ?? '';
		const matches = val.match(/(\d+\.\d+|^.\d+|\d+)/);
		const numVal = matches?.[0] ?? '';

		// Also replace leading dot with 0.
		const valWithZero = numVal
			.replace(/^\./, '0.')
			// Max length is 4 because the jupiter client's slippage only takes integers for basis points
			.slice(0, 4);

		if (isCustomValue) {
			props.onChange(valWithZero);
		}
	};

	const handleChange = () => {
		let val = '';

		// Remove non-number characters
		if (inputRef?.current) {
			val = inputRef?.current?.value?.replace(/[^\d.]/g, '');
		}

		props.onChange(val);
	};

	const handleFocus = () => {
		if (isCustomValue) {
			props.onChange(props.value);
		}
	};

	return (
		<div
			className={twMerge(
				'flex flex-row items-stretch justify-between w-[180px] overflow-hidden border-2 rounded-sm border-container-border mt-0.5 relative top-[1px]',
				props.selected ? 'bg-tab-bg-selected' : 'opacity-40',
				props.className ?? ''
			)}
		>
			<input
				ref={inputRef}
				className={`flex-grow w-full px-4 py-3 text-lg font-bold h-[52px]`}
				onChange={handleChange}
				onBlur={handleBlur}
				onFocus={handleFocus}
				value={props.value}
				disabled={props.disabled}
				placeholder={props.placeholder}
				maxLength={4}
			/>
			<div className="flex flex-col items-center justify-center px-4 py-3 border-l-2 border-container-border">
				<Text.BODY2>{'%'}</Text.BODY2>
			</div>
		</div>
	);
};

type SlippageToleranceProps = {
	value: number;
	onChange: (value: number) => void;
};

const SlippageTolerance = ({ value, onChange }: SlippageToleranceProps) => {
	const [expanded, setExpanded] = useState(false);
	const [customValue, setCustomValue] = useState(`${value}`);

	const isCustomValue = value !== 0.1 && value !== 0.5 && value !== 1;

	const toggleExpanded = () => {
		setExpanded(!expanded);
	};

	const handleSelectedAnOption = (value: number) => {
		onChange(value);
	};

	// Hmm, how to handle NaN? Probably need a separate state for this value vs the actual local storage value
	const handleChangeCustomValue = (newValue: string | undefined) => {
		setCustomValue(newValue ?? '');
		let parsedValue = parseFloat(newValue ?? '');
		if (!isNaN(parsedValue)) {
			if (parsedValue > 100 || parsedValue < 0) {
				parsedValue = Math.max(0.001, Math.min(100, parsedValue));
				setCustomValue(`${parsedValue}`);
			}
			onChange(parsedValue);
		} else {
			onChange(0);
		}
	};

	return (
		<div className="relative mt-4">
			<button onClick={toggleExpanded} className="flex flex-row items-center">
				<Text.BODY2>Slippage Tolerance ({value}%) </Text.BODY2>
				<Chevron open={expanded} className="ml-2" />
			</button>
			<div
				className={`w-full overflow-hidden transition-all ${
					expanded ? 'max-h-[200px]' : 'max-h-0'
				}`}
			>
				<div className="mb-3">
					<Text.BODY1 className="font-normal">
						Applied to repaying your SOL borrow via Jupiter swap
					</Text.BODY1>
				</div>
				<div className="flex flex-row items-center mb-4">
					<Button
						className="rounded-sm rounded-r-none border-r-[1px] px-6 py-3 mt-0"
						outerClassName={'rounded-sm rounded-r-none'}
						selected={value === 0.1}
						onClick={() => handleSelectedAnOption(0.1)}
					>
						<Text.BODY2>0.1%</Text.BODY2>
					</Button>
					<Button
						className="rounded-sm rounded-none border-l-[1px] border-r-[1px] px-6 py-3 mt-0"
						outerClassName={'rounded-sm rounded-none'}
						selected={value === 0.5}
						onClick={() => handleSelectedAnOption(0.5)}
					>
						<Text.BODY2>0.5%</Text.BODY2>
					</Button>
					<Button
						className="rounded-sm rounded-l-none border-l-[1px] px-6 py-3 mt-0"
						outerClassName={'rounded-sm rounded-l-none'}
						selected={value === 1}
						onClick={() => handleSelectedAnOption(1)}
					>
						<Text.BODY2>1.0%</Text.BODY2>
					</Button>
					<SlippageInput
						value={customValue}
						onChange={handleChangeCustomValue}
						selected={isCustomValue}
						className={`hidden md:flex ml-4`}
					/>
				</div>
				<div className="flex flex-row md:hidden mb-2">
					<SlippageInput
						value={customValue}
						onChange={handleChangeCustomValue}
						selected={isCustomValue}
					/>
				</div>
			</div>
		</div>
	);
};

export default React.memo(SlippageTolerance);
