import { BigNum } from '@drift-labs/sdk';
import React from 'react';
import Text from './Text';
import Arrow from '@heroicons/react/24/solid/ArrowLongRightIcon';

const ValueChangeDisplay = ({
	previousValue,
	afterValue,
	leftSymbol = '',
	rightSymbol = '',
	rightLabel = '',
	reverseColours = false,
	forceWhite = false,
	previousValuePrint,
	afterValuePrint,
	overrideNoValueChange,
}: {
	previousValue: number | BigNum;
	afterValue: number | BigNum;
	leftSymbol?: string;
	rightSymbol?: string;
	rightLabel?: string;
	previousValuePrint: string;
	afterValuePrint: string;
	reverseColours?: boolean;
	forceWhite?: boolean;
	overrideNoValueChange?: boolean;
}) => {
	const isEqual =
		typeof afterValue === 'number'
			? afterValue === previousValue
			: afterValue.eq(previousValue as BigNum);

	const isLessThan =
		typeof afterValue === 'number'
			? // @ts-ignore
			  afterValue < previousValue
			: afterValue.lt(previousValue as BigNum);

	const arrowColor = forceWhite
		? 'text-text-default'
		: isLessThan
		  ? !reverseColours
				? 'text-negative-red'
				: 'text-positive-green'
		  : !reverseColours
		    ? 'text-positive-green'
		    : 'text-negative-red';

	return (
		<div className="flex flex-wrap items-center space-x-1 font-numeral">
			<Text.BODY2 className="whitespace-nowrap">
				{`${leftSymbol}${previousValuePrint}${rightSymbol}`}
			</Text.BODY2>
			{!isEqual && !overrideNoValueChange && (
				<Arrow className={`w-4 h-4 ${arrowColor}`} />
			)}
			{!isEqual && !overrideNoValueChange && (
				<Text.BODY2 className="whitespace-nowrap">{`${leftSymbol}${afterValuePrint}${rightSymbol}`}</Text.BODY2>
			)}
			{rightLabel && <Text.BODY2>{rightLabel}</Text.BODY2>}
		</div>
	);
};

export default React.memo(ValueChangeDisplay);
