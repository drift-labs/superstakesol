'use client';

import { Info } from '@drift-labs/icons';
import Tippy, { TippyProps, useSingleton } from '@tippyjs/react';
import EventEmitter from 'events';
import React from 'react';
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SHOW_DEV_CLOSE_TOOLTIP_BORDER = false;

export type TooltipProps = {
	content: ReactNode;
	className?: string;
	// Not sure about naming convention for the className prop.
	// className is for the child node that gets wrapped
	// tooltipClassName is for the tooltip itself
	tooltipClassName?: string;
	placement?: TippyProps['placement'];
	disabled?: boolean;
	size?: number;
	allowHover?: boolean;
	showArrow?: boolean;
	visible?: boolean;
	manualEmitter?: EventEmitter;
	maxWidth?: string;
	customArrow?: ReactNode;
	zIndex?: number;
	slim?: boolean;
	singletonTarget?: ReturnType<typeof useSingleton>[0];
};

const closeTippyByRef = (tippyRef: any) => {
	//@ts-ignore
	if (tippyRef?.current) tippyRef?.current?._tippy?.hide();
};

const HorizontalCloseRegion = ({
	side,
	tippyRef,
}: {
	side: 'left' | 'right';
	tippyRef: any;
}) => {
	return (
		<div
			className={`${
				side === 'left'
					? 'left-0 -translate-x-full'
					: 'right-0 translate-x-full'
			} absolute h-full w-8 ${
				SHOW_DEV_CLOSE_TOOLTIP_BORDER ? 'bg-red-50' : ''
			}`}
			onMouseEnter={() => closeTippyByRef(tippyRef)}
		/>
	);
};

const VerticalCloseRegion = ({
	placement,
	tippyRef,
}: {
	placement: TooltipProps['placement'];
	tippyRef: any;
}) => {
	return (
		<div
			className={`w-full ${placement === 'top' ? 'h-2' : 'h-8'} ${
				SHOW_DEV_CLOSE_TOOLTIP_BORDER ? 'bg-red-50' : ''
			}`}
			onMouseEnter={() => closeTippyByRef(tippyRef)}
		/>
	);
};

/**
 * -- NOTE:
 *
 * The Tippy component gets its styling from the tippy.js/dist/tippy.css imported in _app.tsx.
 *
 * Using tailwind, no way to force our styles to override some of the default styles (unless making the tailwind styles have "!important" which isn't ideal)
 *
 * Therefore, we are using Tooltip.css (located in the components folder), which is imported into _app.tsx (a next.js requirement) to override some of the
 * default styles
 */
const Tooltip = ({
	children,
	content,
	className,
	tooltipClassName = '',
	placement = 'bottom',
	disabled,
	size = 16,
	allowHover,
	showArrow = false,
	visible,
	manualEmitter,
	maxWidth = '20rem',
	customArrow,
	zIndex,
	slim,
	singletonTarget,
}: PropsWithChildren<TooltipProps>) => {
	const tippyRef = useRef<HTMLElement>(null);

	const interactive = !!allowHover;

	useEffect(() => {
		if (manualEmitter) {
			const handler = () => {
				// @ts-ignore
				const instance = tippyRef.current._tippy;
				instance.show();
			};

			manualEmitter.on('event', handler);

			return () => {
				manualEmitter.removeListener('event', handler);
			};
		}
	}, [manualEmitter]);

	return (
		<Tippy
			delay={[200, 0]}
			singleton={singletonTarget}
			animation="scale"
			appendTo={() => document.body}
			maxWidth={maxWidth}
			interactive={interactive}
			className={`p-0`}
			disabled={disabled}
			visible={visible}
			content={
				// Wrapped tippy instance in left and bottom sections which will close the tooltip when they are hovered over. This protects from instances where the tooltip instance might render on top of an area on the page which steals the mouse events from tippy (causing it not to close when it should)
				<div className={`flex items-stretch shrink-0 relative`}>
					{placement !== 'right' && (
						<HorizontalCloseRegion tippyRef={tippyRef} side="left" />
					)}
					<div className="flex flex-col">
						{customArrow && (
							<div className="flex flex-row justify-center">{customArrow}</div>
						)}
						<div
							className={twMerge(
								slim ? 'p-1' : 'p-3',
								`overflow-hidden text-xs leading-5 rounded-sm shadow-md outline-none bg-tooltip-bg text-text-default-2 focus:outline-none border border-container-border dark:border-none`,
								tooltipClassName
							)}
						>
							{content}
						</div>
						{placement !== 'left' && (
							<VerticalCloseRegion tippyRef={tippyRef} placement={placement} />
						)}
					</div>
					<HorizontalCloseRegion tippyRef={tippyRef} side="right" />
				</div>
			}
			arrow={showArrow}
			placement={placement}
			ref={tippyRef}
			zIndex={zIndex}
			ignoreAttributes
		>
			<div
				className={twMerge(`outline-none focus:outline-none flex`, className)}
			>
				{children ? children : <Info size={size} />}
			</div>
		</Tippy>
	);
};

export default React.memo(Tooltip);
