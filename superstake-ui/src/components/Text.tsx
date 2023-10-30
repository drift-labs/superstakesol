import React, { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type TextProps = PropsWithChildren<{
	className?: string;
	onClick?: () => void;
}>;

// sm: '0.875rem',      14px
// base: '1rem',        16px
// lg: '1.25rem',       20px
// xl: '1.5rem',        24px
// '2xl': '1.75rem',    28px
// '3xl': '2rem',       32px
// '4xl': '2.25rem',    36px
// '5xl': '3rem',       48px (not used?)
// '6xl': '4rem',       64px

const H1 = (props: TextProps) => {
	return (
		<h1
			className={twMerge([
				'text-4xl',
				'md:text-6xl',
				'font-semibold',
				'tracking-tight',
				'md:tracking-tighter',
				props.className,
			])}
		>
			{props.children}
		</h1>
	);
};

const H2 = (props: TextProps) => {
	return (
		<h2
			onClick={props.onClick}
			className={twMerge([
				'text-2xl',
				'md:text-4xl',
				'font-bold ',
				props.className,
			])}
		>
			{props.children}
		</h2>
	);
};

const H3 = (props: TextProps) => {
	return (
		<h3
			onClick={props.onClick}
			className={twMerge(['text-3xl', 'font-bold', props.className])}
		>
			{props.children}
		</h3>
	);
};

const H4 = (props: TextProps) => {
	return (
		<h4
			onClick={props.onClick}
			className={twMerge([
				'md:text-2xl',
				'text-xl',
				'font-bold',
				props.className,
			])}
		>
			{props.children}
		</h4>
	);
};

const H5 = (props: TextProps) => {
	return (
		<h5
			onClick={props.onClick}
			className={twMerge([
				'text-lg',
				'md:text-xl',
				'font-semibold',
				'tracking-wide',
				props.className,
			])}
		>
			{props.children}
		</h5>
	);
};

const H6 = (props: TextProps) => {
	return (
		<h6
			onClick={props.onClick}
			className={twMerge([
				'text-base',
				'md:text-lg',
				'font-semibold',
				'tracking-wide',
				props.className,
			])}
		>
			{props.children}
		</h6>
	);
};

const BODY1 = (props: TextProps) => {
	return (
		<span
			onClick={props.onClick}
			className={twMerge(['text-sm font-semibold', props.className])}
		>
			{props.children}
		</span>
	);
};

const BODY2 = (props: TextProps) => {
	return (
		<span
			onClick={props.onClick}
			className={twMerge(['text-base font-semibold', props.className])}
		>
			{props.children}
		</span>
	);
};

const BODY3 = (props: TextProps) => {
	return (
		<span
			onClick={props.onClick}
			className={twMerge(['text-lg font-semibold', props.className])}
		>
			{props.children}
		</span>
	);
};

const BODY4 = (props: TextProps) => {
	return (
		<span
			onClick={props.onClick}
			className={twMerge(['text-xl font-semibold', props.className])}
		>
			{props.children}
		</span>
	);
};

const P1 = (props: TextProps) => {
	return (
		<p
			onClick={props.onClick}
			className={twMerge(['text-base font-semibold', props.className])}
		>
			{props.children}
		</p>
	);
};

const Text = {
	H1: React.memo(H1),
	H2: React.memo(H2),
	H3: React.memo(H3),
	H4: React.memo(H4),
	H5: React.memo(H5),
	H6: React.memo(H6),
	BODY1: React.memo(BODY1),
	BODY2: React.memo(BODY2),
	BODY3: React.memo(BODY3),
	BODY4: React.memo(BODY4),
	P1: React.memo(P1),
};

export default Text;
