import useCurrentLstMetrics from './useCurrentLstMetrics';

/*
 * Returns amount of SOL that will be borrowed to achieve the desired leverage on the active LST
 */
const useBorrowAmountForStake = ({
	lstAmount,
	leverage,
}: {
	lstAmount: number;
	leverage: number;
}) => {
	const lstMetrics = useCurrentLstMetrics();

	if (!lstMetrics.loaded || !lstAmount) return 0;

	const superStakeLstDeposit = lstAmount * leverage;
	return (superStakeLstDeposit - lstAmount) * lstMetrics.priceInSol;
};

export default useBorrowAmountForStake;
