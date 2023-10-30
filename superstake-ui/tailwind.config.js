/** @type {import('tailwindcss').Config} */

const semanticClasses = {
	'body-bg': 'var(--body-bg)',

	'container-bg': 'var(--container-bg)',
	'container-bg-selected': 'var(--container-bg-selected)',
	'container-border': 'var(--container-border)',

	'tooltip-bg': 'var(--tooltip-bg)',
	'tooltip-border': 'var(--tooltip-border)',

	'accent-pink': 'var(--accent-pink)',

	'button-border': 'var(--button-border)',

	'tab-bg': 'var(--tab-bg)',
	'tab-bg-selected': 'var(--tab-bg-selected)',
	'tab-bg-success': 'var(--tab-bg-success)',

	'text-main': 'var(--text-main)',
	'text-default': 'var(--text-default)',
	'text-disabled': 'var(--text-disabled)',
	'text-header': 'var(--text-header)',
	'text-label': 'var(--text-label)',
	'text-positive-green': 'var(--text-positive-green)',
	'text-negative-red': 'var(--text-negative-red)',
	'text-link': 'var(--text-link)',

	'status-neutral': 'var(--status-neutral)',
	'status-positive': 'var(--status-positive)',
	'status-negative': 'var(--status-negative)',
};

module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		fontSize: {
			sm: '0.875rem',
			base: '1rem',
			lg: '1.25rem',
			xl: '1.5rem',
			'2xl': '1.75rem',
			'3xl': '2rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '4rem',
		},
		borderRadius: {
			none: '0px',
			sm: '12px',
			DEFAULT: '20px',
			lg: '36px',
		},
		shadowInner: 'inset 2px 2px 2px rgba(0,0,0,0.25)',
		extend: {
			colors: {
				white: '#FFFFFF',
				black: '#000000',
				neutrals: {
					0: '#000000', // text, arrows, button border, container border
					10: '#1F1F1F', // some other text?
					20: '#333333', // label text,
					70: '#C4C4C4', // disabled arrow
					90: '#FAFAFA', // special background
					100: '#FFFFFF', // background
				},
				red: {
					50: '#ED5A51', // cancel text, negative pnl
				},
				pink: {
					60: '#FAA193', // links :: Luke did this manually for our hidden warning messages - should change if used in prod
					80: '#FFC9B6', // accent, loading bubble
					90: '#FFDED2', // tab selected
				},
				green: {
					30: '#308D8A', // rpc status positive
					50: '#28BE8C', // positive pnl
					80: '#C8ECE0', // success button, success notification bg
				},
				...semanticClasses,
			},
		},
	},
	plugins: [],
};
