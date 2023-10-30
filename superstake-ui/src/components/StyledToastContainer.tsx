import { ToastContainer } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/toast.css';

const StyledToastContainer = () => {
	return (
		<ToastContainer
			position="bottom-right"
			toastClassName={(context) =>
				twMerge(
					'relative flex rounded-sm bg-white p-2 border-2 border-black text-black mt-2 overflow-hidden',
					context?.type && ''
				)
			}
			hideProgressBar
		/>
	);
};

export default StyledToastContainer;
