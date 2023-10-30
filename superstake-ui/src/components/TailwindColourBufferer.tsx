import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Some colours are programatically rendered, but not "hardcoded" anywhere, so tailwind doesn't pre-process the colours/styles ready for when they need to be rendered in the app. This component tricks tailwind into preparing these styles.
 * @returns
 */
const TailwindColourBufferer = () => {
	return (
		<div
			className={twMerge(
				'bg-[var(--status-neutral)]',
				'bg-[var(--status-positive)]',
				'bg-[var(--status-negative)]'
			)}
		/>
	);
};

export default TailwindColourBufferer;
