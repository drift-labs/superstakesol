import { StateSliceDisplay } from './StateSliceDisplay';
import React from 'react';
import useAppStore from '../../hooks/useAppStore';

const CommonStoreStateDisplay = () => {
	const state = useAppStore((s) => s);
	return (
		<div>
			<StateSliceDisplay slice={state} />
		</div>
	);
};

export default React.memo(CommonStoreStateDisplay);
