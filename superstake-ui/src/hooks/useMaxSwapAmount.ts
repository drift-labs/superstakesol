import {
	BN,
	DriftClient,
	getUserAccountPublicKeySync,
	LAMPORTS_PRECISION,
	User,
	BasicUserAccountSubscriber,
} from '@drift-labs/sdk';
import useAppStore from './useAppStore';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOL_SPOT_MARKET_INDEX } from '../utils/uiUtils';
import useCustomDriftClientIsReady from './useCustomDriftClientIsReady';
import { BorshAccountsCoder } from '@coral-xyz/anchor';
import { useCommonDriftStore } from '@drift-labs/react';
import useCurrentLstMetrics from './useCurrentLstMetrics';
import { LST } from '../constants/lst';

/*
 * Returns the max amount of SOL that can be swapped for the active LST without exceeding the max leverage
 */
const useMaxSwapAmount = (lstDeposit: number) => {
	const lstMetrics = useCurrentLstMetrics();

	const currentUser = useAppStore((s) => s.currentUserAccount?.user);
	const driftClient = useCommonDriftStore((s) => s.driftClient?.client);
	const driftClientIsReady = useCustomDriftClientIsReady();
	const user = mockUser(driftClient, currentUser);
	const activeLst = useAppStore((s) => s.activeLst);

	if (!lstMetrics.loaded || !driftClient || !driftClientIsReady || !user) {
		return {
			maxSolSwap: undefined,
			maxLstSwap: undefined,
		};
	}

	updateUserLstPosition(
		user,
		activeLst,
		new BN(Math.min(lstDeposit * LAMPORTS_PER_SOL, Number.MAX_SAFE_INTEGER))
	);

	const lstRatio = new BN(lstMetrics.priceInSol * LAMPORTS_PER_SOL);
	const calculateSwap = (inAmount: BN) => {
		return inAmount.mul(LAMPORTS_PRECISION).div(lstRatio);
	};

	try {
		const { inAmount: maxSolSwap, outAmount: maxLstSwap } =
			user.getMaxSwapAmount({
				inMarketIndex: SOL_SPOT_MARKET_INDEX,
				outMarketIndex: activeLst.spotMarket.marketIndex,
				calculateSwap,
			});

		return {
			maxSolSwap: maxSolSwap.toNumber() / LAMPORTS_PER_SOL,
			maxLstSwap: maxLstSwap.toNumber() / LAMPORTS_PER_SOL,
		};
	} catch (e) {
		console.log(e);
		return {
			maxSolSwap: undefined,
			maxLstSwap: undefined,
		};
	}
};

function mockUser(
	driftClient: DriftClient | undefined,
	currentUser: User | undefined
): User | undefined {
	if (!driftClient || (currentUser && !currentUser.isSubscribed)) {
		return undefined;
	}

	let userAccount;
	const currentUserAccount = currentUser?.getUserAccount();
	if (currentUser && currentUserAccount) {
		userAccount = {
			...currentUserAccount,
			spotPositions: [
				{ ...currentUserAccount.spotPositions[0] },
				{ ...currentUserAccount.spotPositions[1] },
				{ ...currentUserAccount.spotPositions[2] },
				{ ...currentUserAccount.spotPositions[3] },
				{ ...currentUserAccount.spotPositions[4] },
				{ ...currentUserAccount.spotPositions[5] },
				{ ...currentUserAccount.spotPositions[6] },
				{ ...currentUserAccount.spotPositions[7] },
			],
		};
	} else {
		const buffer = Buffer.alloc(4376);
		const discriminator = BorshAccountsCoder.accountDiscriminator('User');
		discriminator.copy(buffer, 0, 0, 8);
		userAccount = driftClient.program.account.user.coder.accounts.decode(
			'User',
			buffer
		);
	}

	const userAccountPublicKey = getUserAccountPublicKeySync(
		driftClient.program.programId,
		driftClient.authority
	);
	return new User({
		driftClient,
		userAccountPublicKey,
		accountSubscription: {
			type: 'custom',
			userAccountSubscriber: new BasicUserAccountSubscriber(
				userAccountPublicKey,
				userAccount,
				1
			),
		},
	});
}

function updateUserLstPosition(user: User, lst: LST, lstDeposit: BN): void {
	const lstMarket = user.driftClient.getSpotMarketAccount(
		lst.spotMarket.marketIndex
	);

	if (!lstMarket) {
		throw Error('lstMarket is undefined');
	}

	const lstPosition =
		user.getSpotPosition(lst.spotMarket.marketIndex) ||
		user.getEmptySpotPosition(lst.spotMarket.marketIndex);
	const clonedPosition = user.cloneAndUpdateSpotPosition(
		lstPosition,
		lstDeposit,
		lstMarket
	);
	const lstPositionIndex = Math.max(
		user
			.getUserAccount()
			.spotPositions.findIndex(
				(pos) => pos.marketIndex === lst.spotMarket.marketIndex
			),
		0
	);
	user.getUserAccount().spotPositions[lstPositionIndex] = clonedPosition;
}

export default useMaxSwapAmount;
