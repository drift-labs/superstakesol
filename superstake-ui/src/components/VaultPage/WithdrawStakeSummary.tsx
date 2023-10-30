import React, { PropsWithChildren } from 'react';
import Text from '../Text';
// import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
// import ChevronUpIcon from '@heroicons/react/24/solid/ChevronUpIcon';

const SummaryRow = ({ children }: PropsWithChildren) => {
	return (
		<div className="flex flex-col items-start justify-between w-full md:flex-row">
			{children}
		</div>
	);
};

type WithdrawStakeSummaryProps = {
	amountToWithdrawLst: number;
	amountToWithdrawSol: number;
	lstSymbol: string;
	// These should be 0 if we're displaying this, but making them props just in case
	lstAmountStaked?: number;
	currentSolBorrow?: number;
};

const WithdrawStakeSummary = ({
	amountToWithdrawLst,
	amountToWithdrawSol,
	lstAmountStaked = 0,
	currentSolBorrow = 0,
	lstSymbol,
}: WithdrawStakeSummaryProps) => {
	return (
		<>
			<div className="w-full p-4 mb-2 space-y-4 bg-container-bg-selected md:space-y-2">
				<SummaryRow>
					<Text.BODY2 className="font-normal">Amount staked</Text.BODY2>{' '}
					<Text.BODY2 className={lstAmountStaked === 0 ? 'opacity-50' : ''}>
						{lstAmountStaked.toFixed(3)} {lstSymbol}
					</Text.BODY2>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">Amount borrowed</Text.BODY2>{' '}
					<Text.BODY2 className={lstAmountStaked === 0 ? 'opacity-50' : ''}>
						{(-1 * currentSolBorrow).toFixed(3)} SOL
					</Text.BODY2>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">
						Available to withdraw:
					</Text.BODY2>{' '}
					<div className="md:text-right">
						<div>
							<Text.BODY2
								className={amountToWithdrawLst === 0 ? 'opacity-50' : ''}
							>
								{amountToWithdrawLst.toFixed(3)} {lstSymbol}
							</Text.BODY2>
						</div>
						{amountToWithdrawSol > 0 && (
							<div>
								<Text.BODY2>{amountToWithdrawSol.toFixed(3)} SOL</Text.BODY2>
							</div>
						)}
					</div>
				</SummaryRow>
			</div>
		</>
	);
};

export default React.memo(WithdrawStakeSummary);
