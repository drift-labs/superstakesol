import { create } from 'zustand';
import { produce } from 'immer';
import {
	BigNum,
	DepositRecord,
	SpotPosition,
	User,
	UserAccount,
	Event,
	SwapRecord,
} from '@drift-labs/sdk';
import { B_SOL, JITO_SOL, LST, M_SOL } from '../constants/lst';
import Env from '../constants/environment';

const DEFAULT_LEVERAGE_SLIDER_VALUE = 2;

// any relevant user data we can keep up to date here
export type UserData = {
	user: User | undefined;
	userAccount: UserAccount | undefined;
	spotPositions: SpotPosition[];
	leverage: number;
	accountId: number | undefined;
	loaded: boolean;
};

export const DEFAULT_USER_DATA: UserData = {
	user: undefined,
	userAccount: undefined,
	spotPositions: [],
	leverage: 0,
	accountId: undefined,
	loaded: false,
};

export type SpotMarketData = {
	tvl: {
		[key: string]: BigNum;
	};
	solBorrowCapacityRemaining: BigNum;
	percentOfCapUsed: number;
	tvlLoaded: boolean;
	loaded: boolean;
};

const DEFAULT_SPOT_MARKET_DATA: SpotMarketData = {
	tvl: {
		[M_SOL.symbol]: BigNum.zero(),
		[JITO_SOL.symbol]: BigNum.zero(),
		[B_SOL.symbol]: BigNum.zero(),
	},
	solBorrowCapacityRemaining: BigNum.zero(),
	percentOfCapUsed: 0,
	tvlLoaded: false,
	loaded: false,
};

export interface AppStoreState {
	currentUserAccount: UserData;
	newAccountPollingTimer?: NodeJS.Timer;
	activeLst: LST;
	modals: {
		showConnectWalletModal: boolean;
		showAcknowledgeTermsModal: boolean;
		showTermsAndConditionModal: {
			isFromAcknowledgeModal: boolean;
			show: boolean;
		};
		showRpcSwitcherModal: boolean;
		showPriorityFeesModal: boolean;
	};
	stakeUnstakeForm: {
		leverageToUse: number;
		isMaxStake: boolean;
		amountToStakeString: string;
		amountToStakeUncappedString: string;
		isMaxUnstake: boolean;
		amountToUnstakeString: string;
		unstakeLeverage?: number;
	};
	spotMarketData: SpotMarketData;
	eventRecords: {
		mostRecentTx: string | undefined;
		depositRecords: Event<DepositRecord>[];
		swapRecords: Event<SwapRecord>[];
		loaded: boolean;
	};
	set: (x: (s: AppStoreState) => void) => void;
	get: () => AppStoreState;
	clearUserData: () => void;
}

const defaultActiveLst = Env.defaultActiveLst;

export const DEFAULT_STORE_STATE = {
	currentUserAccount: DEFAULT_USER_DATA,
	activeLst: defaultActiveLst,
	modals: {
		showConnectWalletModal: false,
		showAcknowledgeTermsModal: false,
		showTermsAndConditionModal: {
			show: false,
			isFromAcknowledgeModal: false,
		},
		showRpcSwitcherModal: false,
		showPriorityFeesModal: false,
	},
	stakeUnstakeForm: {
		leverageToUse: DEFAULT_LEVERAGE_SLIDER_VALUE,
		isMaxStake: false,
		amountToStakeString: '',
		amountToStakeUncappedString: '',
		isMaxUnstake: false,
		amountToUnstakeString: '',
	},
	spotMarketData: DEFAULT_SPOT_MARKET_DATA,
	eventRecords: {
		mostRecentTx: undefined,
		depositRecords: [],
		swapRecords: [],
		loaded: false,
	},
};

const useAppStore = create<AppStoreState>()((set, get) => {
	const setProducerFn = (fn: (s: AppStoreState) => void) => set(produce(fn));
	return {
		...DEFAULT_STORE_STATE,
		set: setProducerFn,
		get: () => get(),
		clearUserData: () => {
			setProducerFn((s) => {
				s.currentUserAccount = DEFAULT_USER_DATA;
				s.eventRecords = {
					depositRecords: [],
					swapRecords: [],
					mostRecentTx: undefined,
					loaded: false,
				};
			});
		},
	};
});

export default useAppStore;
