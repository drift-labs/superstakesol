import React, { useState } from 'react';
import CommonStoreStateDisplay from './CommonStoreStateDisplay';
import AppStoreStateDisplay from './AppStoreStateDisplay';

const DebugPanel = () => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={'w-[400px] h-full fixed bottom-0 right-0'}>
			<button onClick={() => setExpanded(!expanded)}>
				{expanded ? 'Hide' : 'Show'} State
			</button>
			<div
				className={`bg-container-bg max-h-[98vh] ${expanded ? '' : 'hidden'}`}
			>
				<div className="p-2 border h-[49vh] overflow-auto">
					<CommonStoreStateDisplay />
				</div>
				<div className="h-[49vh] overflow-auto">
					<AppStoreStateDisplay />
				</div>
			</div>
		</div>
	);
};

export default React.memo(DebugPanel);
