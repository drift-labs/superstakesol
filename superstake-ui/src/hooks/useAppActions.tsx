import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import useAppStore from './useAppStore';
import createAppActions from '../actions/appActions';
import { useCommonDriftStore, usePriorityFeeStore } from '@drift-labs/react';

const ActionsContext = createContext({});

export const ActionsProvider = (props: PropsWithChildren) => {
	const [getAppStore, setAppStore] = useAppStore((s) => [s.get, s.set]);
	const [getCommonDriftStore, setCommonDriftStore] = useCommonDriftStore(
		(s) => [s.get, s.set]
	);
	const getPriorityFeeToUse = usePriorityFeeStore((s) => s.getPriorityFeeToUse);

	const actions = useMemo(
		() =>
			createAppActions(
				getAppStore,
				setAppStore,
				getCommonDriftStore,
				setCommonDriftStore,
				getPriorityFeeToUse
			),
		[
			getAppStore,
			setAppStore,
			getCommonDriftStore,
			setCommonDriftStore,
			getPriorityFeeToUse,
		]
	);

	return (
		<ActionsContext.Provider value={actions}>
			{props.children}
		</ActionsContext.Provider>
	);
};

export const useAppActions = () => {
	const actions = useContext(ActionsContext) as ReturnType<
		typeof createAppActions
	>;

	return actions;
};
