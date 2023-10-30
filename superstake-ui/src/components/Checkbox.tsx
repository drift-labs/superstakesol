import { twMerge } from 'tailwind-merge';
import Check from '@heroicons/react/24/solid/CheckIcon';

const Checkbox = ({
	checked,
	className,
	onChange = () => {},
}: {
	checked: boolean;
	className?: string;
	onChange?: () => void;
}) => {
	return (
		<div
			className={twMerge(
				'w-4 h-4 cursor-pointer border border-black rounded-[3px] relative',
				className
			)}
			onClick={onChange}
		>
			{/** A cover that gives the illusion of animating the check mark */}
			<div
				className={twMerge(
					'absolute h-[80%] bg-white rounded transition-all duration-500 right-[1px] top-[1px] bottom-[1px]',
					checked ? 'w-0' : 'w-[90%]'
				)}
			/>
			<Check />
		</div>
	);
};

export default Checkbox;
