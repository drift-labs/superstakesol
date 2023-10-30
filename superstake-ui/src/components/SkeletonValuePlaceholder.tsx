import React from 'react';
import { twMerge } from 'tailwind-merge';

export const SkeletonValuePlaceholder = (props: {
	className?: string;
	loading?: boolean;
}) => {
	return (
		<div
			className={twMerge([
				'relative',
				'rounded-[4px]',
				'bg-container-bg-selected',
				props.loading ? `skeleton-value-placeholder-animate` : '',
				props.className ?? '',
			])}
		></div>
	);
};

export default SkeletonValuePlaceholder;
