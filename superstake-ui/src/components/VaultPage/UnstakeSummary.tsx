import React, { PropsWithChildren } from 'react';
import Text from '../Text';
import ValueChangeDisplay from '../ValueChangeDisplay';
// import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
// import ChevronUpIcon from '@heroicons/react/24/solid/ChevronUpIcon';

const SummaryRow = ({ children }: PropsWithChildren) => {
	return (
		<div className="flex flex-col md:flex-row justify-between items-start w-full">
			{children}
		</div>
	);
};

type UnstakeSummaryProps = {
	amountToUnstake: number;
	currentTotalStake: number;
	newTotalStake: number;
	currentSolBorrow: number;
	amountToRepay: number;
	currentLeverage: number;
	newLeverage: number;
	currentLiqRatio: number;
	newLiqRatio: number;
	lstSymbol: string;
};

const UnstakeSummary = ({
	amountToUnstake,
	currentTotalStake,
	newTotalStake,
	currentSolBorrow,
	amountToRepay,
	currentLeverage,
	newLeverage,
	currentLiqRatio,
	newLiqRatio,
	lstSymbol,
}: UnstakeSummaryProps) => {
	const remainingSolBorrow = currentSolBorrow - amountToRepay;
	// const remainingStake = currentTotalStake - amountToUnstake * currentLeverage; // this might be a bit off

	return (
		<>
			<div className="w-full p-4 bg-container-bg-selected mb-2 space-y-4 md:space-y-2">
				<SummaryRow>
					<Text.BODY2 className="font-normal">Amount to unstake</Text.BODY2>{' '}
					<Text.BODY2>
						{amountToUnstake.toFixed(3)} {lstSymbol}
					</Text.BODY2>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">Your position</Text.BODY2>{' '}
					<ValueChangeDisplay
						previousValue={currentTotalStake}
						afterValue={newTotalStake}
						previousValuePrint={currentTotalStake.toFixed(3)}
						afterValuePrint={newTotalStake.toFixed(3)}
						rightSymbol={` ${lstSymbol}`}
					/>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">Amount borrowed</Text.BODY2>{' '}
					<ValueChangeDisplay
						previousValue={-1 * currentSolBorrow}
						previousValuePrint={(-1 * currentSolBorrow).toFixed(3)}
						afterValue={-1 * remainingSolBorrow}
						afterValuePrint={(-1 * remainingSolBorrow).toFixed(3)}
						rightSymbol=" SOL"
					/>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">Leverage</Text.BODY2>{' '}
					<ValueChangeDisplay
						previousValue={currentLeverage}
						afterValue={newLeverage ?? 0}
						previousValuePrint={currentLeverage.toFixed(2)}
						afterValuePrint={newLeverage ? newLeverage.toFixed(2) : '0'}
						rightSymbol="x"
					/>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">
						Est. liquidation ratio ({lstSymbol}/SOL)
					</Text.BODY2>{' '}
					<div>
						<ValueChangeDisplay
							previousValue={currentLiqRatio}
							afterValue={newLiqRatio ?? 0}
							previousValuePrint={currentLiqRatio.toFixed(4)}
							afterValuePrint={newLiqRatio ? newLiqRatio.toFixed(4) : '0'}
						/>
					</div>
				</SummaryRow>
			</div>
		</>
	);
};

export default React.memo(UnstakeSummary);
