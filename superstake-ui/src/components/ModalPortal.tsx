import useDisableScroll from '../hooks/useDisableScroll';
import PropTypes from 'prop-types';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const ModalPortal = (props: PropsWithChildren<{ id?: string }>) => {
	const defaultNode = useRef<HTMLElement | null>(null);
	const [mounted, setMounted] = useState(false);

	useDisableScroll();

	useEffect(() => {
		// Only run on client-side
		if (typeof window !== 'undefined') {
			if (!defaultNode.current) {
				let portalDock = document.getElementById('modal-portal-dock');

				if (!portalDock) {
					portalDock = document.createElement('div');
					portalDock.id = 'modal-portal-dock';
					document.body.appendChild(portalDock);
				}

				defaultNode.current = portalDock;
			}
			setMounted(true);
		}
	}, []);

	// Don't render anything on the server
	if (!mounted || typeof window === 'undefined') {
		return null;
	}

	return ReactDOM.createPortal(
		<div style={{ zIndex: 100, position: 'absolute' }}>{props.children}</div>,
		defaultNode.current!
	);
};

ModalPortal.propTypes = {
	children: PropTypes.node.isRequired,
	node: PropTypes.any,
};

export default ModalPortal;
