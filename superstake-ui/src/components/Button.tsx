import React, { ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = {
	onClick?: () => void;
	children?: ReactNode;
	className?: string;
	disabled?: boolean;
	selected?: boolean;
	outerClassName?: string;
};

const Button = (props: ButtonProps) => {
	const [isPressed, setIsPressed] = useState(false);

	const handlePressed = () => {
		setIsPressed(true);
	};

	const handleUnPressed = () => {
		setIsPressed(false);
	};

	return (
		<div
			className={twMerge(
				'bg-container-border border-container-border rounded relative mt-2',
				props.className?.includes('w-full') ? 'w-full' : '',
				props.outerClassName
			)}
		>
			<button
				className={twMerge(
					`border-container-border border-2 rounded bg-container-bg py-3 px-6 md:px-9 transition-all relative bottom-1 shadow-[inset_0_0_0_rgba(255,201,182,1)]`,
					isPressed || props.disabled ? 'bottom-0' : '',
					props.disabled
						? 'bg-container-bg-selected text-text-disabled'
						: 'text-text-label',
					props.selected
						? 'bottom-0 bg-tab-bg-selected text-text-label shadow-[inset_0_6px_0_rgba(255,201,182,1)]'
						: '',
					props.className
				)}
				onClick={props.disabled ? undefined : props.onClick}
				onTouchStart={props.disabled ? undefined : handlePressed}
				onMouseDown={props.disabled ? undefined : handlePressed}
				onMouseUp={handleUnPressed}
				onMouseLeave={handleUnPressed}
				onTouchEnd={handleUnPressed}
			>
				{props.children}
			</button>
		</div>
	);
};

export default React.memo(Button);
