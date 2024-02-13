import { Info } from '@drift-labs/icons';
import Tippy, { TippyProps, useSingleton } from '@tippyjs/react';
import EventEmitter from 'events';
import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import '../styles/tooltip.css';

type TooltipProps = {
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
	singletonTarget?: ReturnType<typeof useSingleton>[0];
};

const Tooltip = ({
	children,
	content,
	className,
	tooltipClassName = '',
	placement = 'bottom',
	disabled,
	size = 18,
	showArrow = false,
	visible,
	manualEmitter,
	maxWidth = '20rem',
	customArrow,
	zIndex,
	singletonTarget,
}: PropsWithChildren<TooltipProps>) => {
	const tippyRef = useRef(null);

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
			delay={[0, 0]}
			singleton={singletonTarget}
			animation="scale"
			appendTo={() => document.body}
			maxWidth={maxWidth}
			interactive={true}
			className={`p-0`}
			disabled={disabled}
			visible={visible}
			trigger="click"
			content={
				<div className={`flex items-stretch shrink-0 relative`}>
					<div className="flex flex-col">
						{customArrow && (
							<div className="flex flex-row justify-center">{customArrow}</div>
						)}
						<div
							className={`rounded-[23px] shadow-lg overflow-hidden outline-none focus:outline-none gradient-border-tooltip p-[2px]`}
						>
							<div
								className={`relative z-10 overflow-hidden rounded p-4 w-full h-full bg-tooltip-bg text-text-default ${tooltipClassName}`}
							>
								{content}
							</div>
						</div>
					</div>
				</div>
			}
			arrow={showArrow}
			placement={placement}
			ref={tippyRef}
			zIndex={zIndex}
		>
			<span className={` outline-none focus:outline-none ${className}`}>
				{children ? children : <Info height={size} width={size} />}
			</span>
		</Tippy>
	);
};

export default Tooltip;
