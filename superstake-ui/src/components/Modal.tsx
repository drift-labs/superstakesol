import type { MouseEvent as ReactMouseEvent } from 'react';
import {
	MutableRefObject,
	PropsWithChildren,
	useEffect,
	useRef,
	useState,
} from 'react';
import ModalPortal from './ModalPortal';
import XMark from '@heroicons/react/24/solid/XMarkIcon';
import Text from './Text';
import { twMerge } from 'tailwind-merge';

const clickedInsideElement = (
	event: MouseEvent,
	element: HTMLElement | null
) => {
	let target = event.target as HTMLElement;
	let clickedInsideElement = false;
	if (element) {
		while (target.parentNode) {
			if (element.contains(target)) {
				clickedInsideElement = true;
				break;
			}
			target = target.parentNode as HTMLElement;
		}
	}
	return clickedInsideElement;
};

export const ModalBackground = (
	props: PropsWithChildren<{
		onClose: () => void;
		contentRef: null | MutableRefObject<any>;
		id?: string;
	}>
) => {
	const backgroundRef = useRef<HTMLDivElement>(null);
	const [isClosing, setIsClosing] = useState(false);

	const closingModalFromBackground = (event: ReactMouseEvent) => {
		const eventWasInsideModal = clickedInsideElement(
			event.nativeEvent,
			backgroundRef?.current
		);

		if (
			!eventWasInsideModal ||
			(props.contentRef?.current.contains(event.target) &&
				event.target !== props.contentRef?.current)
		) {
			return;
		}

		setIsClosing(true);
	};

	useEffect(() => {
		document.body.classList.add(`overflow-hidden`);

		return () => {
			document.body.classList.remove(`overflow-hidden`);
		};
	}, []);

	const handleClose = () => {
		if (isClosing) {
			props.onClose();
		}
	};

	return (
		<div
			className={`fixed z-50 inset-0 w-screen h-screen overflow-auto sm:overflow-hidden`}
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
			id={props.id}
			onMouseDown={closingModalFromBackground}
			ref={backgroundRef}
		>
			<div className="min-h-screen px-4 pb-20 sm:block sm:p-0">
				<div
					className={`fixed inset-0 transition-opacity bg-opacity-50`}
					aria-hidden="true"
					onMouseUp={handleClose}
				>
					{props.children}
				</div>

				<span
					className="hidden sm:inline-block sm:align-middle sm:h-screen"
					aria-hidden="true"
				>
					&#8203;
				</span>
			</div>
		</div>
	);
};

export const ModalTitle = ({
	title,
	center,
	className,
}: {
	title: string;
	center?: boolean;
	className?: string;
}) => {
	return (
		<div
			className={twMerge(
				'flex flex-col w-full px-6 mt-4 mb-12 space-y-2',
				center && 'md:items-center',
				className
			)}
		>
			<Text.H2>{title}</Text.H2>
			<div className="w-10 h-1 rounded bg-container-border" />
		</div>
	);
};

type ModalProps = PropsWithChildren<{
	onClose: () => void;
	className?: string;
	id?: string;
	showX?: boolean;
	visible?: boolean; // Pass visibility in as prop to trigger onClose because we want to animate the close
}>;

export const Modal = ({
	onClose,
	children,
	className,
	id,
	showX,
	visible,
}: ModalProps) => {
	const closingTimeout = useRef<NodeJS.Timeout | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	// Animate on initial load
	// Not sure why this needs a timeout but it does
	useEffect(() => {
		setTimeout(() => {
			if (contentRef?.current) {
				contentRef.current.style.top = `0%`;
			}
		}, 10);
	}, []);

	// Animate back when closing
	const handleCloseModalStart = () => {
		if (contentRef?.current?.style?.top) {
			contentRef.current.style.top = `100%`;
			closingTimeout.current = setTimeout(() => {
				onClose();
			}, 250);
		}
	};

	// Close if visible prop became false and not already closing
	// Can be used to close the modal from external state
	useEffect(() => {
		if (!visible && !closingTimeout.current) {
			handleCloseModalStart();
		}
	}, [visible]);

	return (
		<ModalPortal id={id}>
			<ModalBackground onClose={handleCloseModalStart} contentRef={contentRef}>
				<div
					ref={contentRef}
					className={`absolute top-[100%] w-full h-full transition-all ${
						className ?? ''
					}`}
				>
					<div
						className="relative w-full h-full max-w-[1280px] mx-auto bg-container-bg border-2 border-container-border mt-32 rounded-t p-4 px-2 md:px-6"
						style={{
							maxHeight: 'calc(100% - 8rem + 2px)',
						}}
					>
						{showX !== false && (
							<button
								onClick={handleCloseModalStart}
								className="absolute flex items-center justify-around w-10 h-10 border-2 rounded rounded-full top-8 right-7 md:top-10 md:right-10 border-container-border"
							>
								<XMark className="w-6 h-6" />
							</button>
						)}
						{children}
					</div>
				</div>
			</ModalBackground>
		</ModalPortal>
	);
};
