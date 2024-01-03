'use client';

import { BigNum } from '@drift-labs/sdk';
import React from 'react';
import Text from './Text';
import SkeletonValuePlaceholder from './SkeletonValuePlaceholder';
import Link from 'next/link';

type CrossCollateralInputProps = {
	maxAmount: BigNum;
	lstSymbol: string;
	onChange: (val?: string) => void;
	label: string;
	value?: string;
	onMax?: () => void;
	onConnect?: () => void;
	amountLabel?: string;
	isBorrowAmount?: boolean;
	currentBalance?: BigNum;
	disabled?: boolean;
	placeholder?: string;
	maxLoading?: boolean;
	showBuyButton?: boolean;
	connected?: boolean;
};

const CollateralInput = (props: CrossCollateralInputProps) => {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	const handleBlur = () => {
		// Filter out excess dots, e.g. "2.31.3 or .23."
		const val = inputRef?.current?.value ?? '';
		const matches = val.match(/(\d+\.\d+|^.\d+|\d+)/);
		const numVal = matches?.[0] ?? '';

		// Also replace leading dot with 0.
		const valWithZero = numVal.replace(/^\./, '0.');

		props.onChange(valWithZero);
	};

	const handleChange = () => {
		let val = '';

		// Remove non-number characters
		if (inputRef?.current) {
			val = inputRef?.current?.value?.replace(/[^\d.]/g, '');
		}

		props.onChange(val);
	};

	const connectButton = (
		<Text.BODY2 className="flex flex-row items-center space-x-2">
			<button
				className="border-b border-container-border"
				onClick={props.onConnect}
			>
				Connect Wallet
			</button>
		</Text.BODY2>
	);

	const maxButton = (
		<Text.BODY2 className="flex flex-row items-center space-x-2">
			<div>Max:</div>
			{props.maxLoading ? (
				<SkeletonValuePlaceholder loading className="w-20 h-5 mr-2" />
			) : (
				<button
					className="border-b border-container-border"
					onClick={props.onMax}
				>
					{props.maxAmount.toFixed(3)} {props.lstSymbol}
				</button>
			)}
		</Text.BODY2>
	);

	return (
		<div className="w-full">
			<div className="flex flex-row items-end justify-between w-full mb-2">
				<Text.BODY3 className="text-text-label">{props.label}</Text.BODY3>
				<div className="hidden md:block">
					{props.connected ? maxButton : connectButton}
				</div>
			</div>
			<div className="flex flex-row items-stretch justify-between w-full overflow-hidden border-2 rounded-sm border-container-border">
				<input
					ref={inputRef}
					className="flex-grow w-full px-3 py-3 text-2xl font-bold md:px-6"
					onChange={handleChange}
					onBlur={handleBlur}
					value={props.value}
					disabled={props.disabled}
					placeholder={props.placeholder}
					maxLength={18}
				/>
				<div className="flex flex-col items-center justify-center px-3 py-3 border-l-2 border-container-border md:px-6">
					<Text.BODY4>{props.lstSymbol ?? ''}</Text.BODY4>
				</div>
			</div>
			<div className="flex flex-row-reverse justify-between mt-2">
				{props.showBuyButton !== false && (
					<Link
						href={`https://jup.ag/swap/SOL-${props.lstSymbol}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Text.BODY2 className="border-b border-container-border pb-[2px]">
							Get {props.lstSymbol ?? ''}
						</Text.BODY2>
					</Link>
				)}
				<div className="md:hidden mb-3">
					{props.connected ? maxButton : connectButton}
				</div>
			</div>
		</div>
	);
};

export default React.memo(CollateralInput);
