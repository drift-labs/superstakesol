'use client';

import { BigNum } from '@drift-labs/sdk';
import React from 'react';
import Text from './Text';
import SkeletonValuePlaceholder from './SkeletonValuePlaceholder';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

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

type CollateralInputProps = {
	label: string;
	value?: string;
	inputClassName?: string;
	rightLabel?: React.ReactNode;
	rightLabelClassName?: string;
	bottomLeftContent?: React.ReactNode;
	bottomRightContent?: React.ReactNode;
	onChange: (val?: string) => void;
	disabled?: boolean;
	placeholder?: string;
	lstSymbol?: string;
};

export const CollateralInput = ({
	label,
	value,
	inputClassName,
	rightLabel,
	rightLabelClassName,
	bottomLeftContent,
	bottomRightContent,
	onChange,
	disabled,
	placeholder,
	lstSymbol,
}: CollateralInputProps) => {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	const handleBlur = () => {
		// Filter out excess dots, e.g. "2.31.3 or .23."
		const val = inputRef?.current?.value ?? '';
		const matches = val.match(/(\d+\.\d+|^.\d+|\d+)/);
		const numVal = matches?.[0] ?? '';

		// Also replace leading dot with 0.
		const valWithZero = numVal.replace(/^\./, '0.');

		onChange(valWithZero);
	};

	const handleChange = () => {
		let val = '';

		// Remove non-number characters
		if (inputRef?.current) {
			val = inputRef?.current?.value?.replace(/[^\d.]/g, '');
		}

		onChange(val);
	};

	return (
		<div className="w-full">
			<div className="flex flex-row items-end justify-between w-full mb-2">
				<Text.BODY3 className="text-base md:text-lg text-text-label">
					{label}
				</Text.BODY3>
				<div className={twMerge(rightLabelClassName)}>{rightLabel}</div>
			</div>
			<div className="flex flex-row items-stretch justify-between w-full overflow-hidden border-2 rounded-sm border-container-border">
				<input
					ref={inputRef}
					className={twMerge(
						'flex-grow w-full px-3 py-3 text-2xl font-bold md:px-6',
						inputClassName
					)}
					onChange={handleChange}
					onBlur={handleBlur}
					value={value}
					disabled={disabled}
					placeholder={placeholder}
					maxLength={18}
				/>
				<div className="flex flex-col items-center justify-center px-3 py-3 border-l-2 border-container-border md:px-6">
					<Text.BODY4 className=" md:text-xl text-[18px]">
						{lstSymbol ?? ''}
					</Text.BODY4>
				</div>
			</div>
			<div className="flex justify-between w-full mt-2">
				<div>{bottomLeftContent}</div>
				<div>{bottomRightContent}</div>
			</div>
		</div>
	);
};

const _StakeFormConnectButton = ({ onConnect }: { onConnect: () => void }) => (
	<Text.BODY2 className="flex flex-row items-center space-x-2">
		<button className="border-b border-container-border" onClick={onConnect}>
			Connect Wallet
		</button>
	</Text.BODY2>
);

const _StakeFormMaxButton = (props: {
	maxLoading: boolean;
	maxAmount: BigNum;
	lstSymbol: string;
	onMax: () => void;
}) => (
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

const _StakeFormCollateralInput = (props: CrossCollateralInputProps) => {
	return (
		<div className="w-full">
			{/* <CollateralInput
				label={props.label}
				value={props.value}
				rightLabel={
					props.connected ? (
						<_StakeFormMaxButton
							maxLoading={props.maxLoading}
							maxAmount={props.maxAmount}
							lstSymbol={props.lstSymbol}
							onMax={props.onMax}
						/>
					) : (
						<_StakeFormConnectButton onConnect={props.onConnect} />
					)
				}
				rightLabelClassName="hidden md:block"
				onChange={props.onChange}
				disabled={props.disabled}
				placeholder={props.placeholder}
			/> */}

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
				<div className="mb-3 md:hidden">
					{props.connected ? (
						<_StakeFormMaxButton
							maxLoading={props.maxLoading}
							maxAmount={props.maxAmount}
							lstSymbol={props.lstSymbol}
							onMax={props.onMax}
						/>
					) : (
						<_StakeFormConnectButton onConnect={props.onConnect} />
					)}
				</div>
			</div>
		</div>
	);
};

export const StakeFormCollateralInput = React.memo(_StakeFormCollateralInput);
