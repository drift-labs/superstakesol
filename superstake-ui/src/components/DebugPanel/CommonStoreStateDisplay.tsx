import { useCommonDriftStore } from '@drift-labs/react';
import { StateSliceDisplay } from './StateSliceDisplay';
import React from 'react';

const CommonStoreStateDisplay = () => {
	const state = useCommonDriftStore((s) => s);
	return (
		<div>
			<StateSliceDisplay slice={state} />
		</div>
	);
};

export default React.memo(CommonStoreStateDisplay);
