'use client';

import { ActionsProvider } from '../hooks/useAppActions';
import PostHogProvider from '../providers/PostHogProvider';
import { PropsWithChildren, useCallback } from 'react';
import AppSetup from './AppSetup';
import TailwindColourBufferer from './TailwindColourBufferer';

import Env from '../constants/environment';
import {
	DEFAULT_BREAKPOINTS,
	DriftProvider,
	initializeDriftStore,
} from '@drift-labs/react';
import { toast } from 'react-toastify';

initializeDriftStore(Env);

const AppWrapper = (props: PropsWithChildren<any>) => {
	const geoBlockCallback = useCallback(
		() =>
			toast.error(
				'You are not allowed to use Super Stake Sol from a restricted territory.',
				{
					autoClose: false,
					closeOnClick: false,
					toastId: 'geoblock',
				}
			),
		[]
	);

	return (
		<PostHogProvider>
			<ActionsProvider>
				<DriftProvider
					geoBlocking={{ callback: geoBlockCallback }}
					autoconnectionDelay={3000}
					breakpoints={DEFAULT_BREAKPOINTS}
				>
					<AppSetup>{props.children}</AppSetup>
					<TailwindColourBufferer />
				</DriftProvider>
			</ActionsProvider>
		</PostHogProvider>
	);
};

export default AppWrapper;
