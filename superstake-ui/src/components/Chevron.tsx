import ChevronUp from '@heroicons/react/24/solid/ChevronUpIcon';
import { twMerge } from 'tailwind-merge';

const Chevron = ({
	open,
	className,
}: {
	open: boolean;
	className?: string;
}) => {
	return (
		<ChevronUp
			className={twMerge(
				'w-6 h-6 transition-transform',
				open ? 'rotate-0' : 'rotate-180',
				className
			)}
		/>
	);
};

export default Chevron;
