import React, { PropsWithChildren, useState } from 'react';
import Text from '../Text';
import Chevron from '../Chevron';
import { twMerge } from 'tailwind-merge';
import useCurrentSuperstakePosition from '../../hooks/useCurrentSuperstakePosition';
import ValueChangeDisplay from '../ValueChangeDisplay';
import { SOL_SPOT_MARKET_INDEX } from '../../utils/uiUtils';
import { BigNum, SpotMarkets } from '@drift-labs/sdk';
import useAppStore from '../../hooks/useAppStore';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import { useAccountCreationCost, useCommonDriftStore } from '@drift-labs/react';
import { useHasSuperstakeLstSubaccount } from '../../hooks/useHasSuperstakeLstSubaccount';
import { Info, Share } from '@drift-labs/icons';
import Tooltip from '../Tooltip';
import { MIN_LEFTOVER_SOL, NEW_ACCOUNT_DONATION } from '@drift/common';

const SummaryRow = ({ children }: PropsWithChildren) => {
	return (
		<div className="flex flex-col items-start justify-between w-full md:flex-row">
			{children}
		</div>
	);
};

type StakeFormSummaryProps = {
	amountToStake: number;
	amountToBorrow: number;
	totalToStake: number;
	currentLiqRatio: number;
	projectedLiqRatio: number;
	projectedApr: number;
	unleveragedApr: number;
	lstApr: number;
	lstDepositRate: number;
	solBorrowRate: number;
	emissionsApr?: number;
	emissionsTokenSymbol?: string;
	leverageToUse?: number;
	// projectedYield30d: number;
};

const StakeFormSummary = ({
	amountToStake,
	amountToBorrow,
	totalToStake,
	projectedLiqRatio,
	currentLiqRatio = 0,
	projectedApr = 0,
	unleveragedApr = 0,
	lstApr = 0,
	lstDepositRate = 0,
	solBorrowRate = 0,
	emissionsApr,
	emissionsTokenSymbol,
	leverageToUse = 1,
}: // projectedYield30d,
StakeFormSummaryProps) => {
	const activeLst = useAppStore((s) => s.activeLst);
	const solSpotMarket = SpotMarkets['mainnet-beta'][SOL_SPOT_MARKET_INDEX];
	const { userLstDeposits, userSolBorrows } = useCurrentSuperstakePosition();
	const { accountCreationCost } = useAccountCreationCost();
	const hasSuperstakeLstSubaccount = useHasSuperstakeLstSubaccount();

	const solBalance = useCommonDriftStore((s) => s.currentSolBalance);
	const hasEnoughSolToCreateAccount =
		solBalance.loaded &&
		solBalance.value.gte(accountCreationCost.add(MIN_LEFTOVER_SOL));

	const [aprExpanded, setAprExpanded] = useState(false);

	const toggleAprExpanded = () => {
		setAprExpanded(!aprExpanded);
	};

	const afterSolBorrows = userSolBorrows
		.neg()
		.add(BigNum.fromPrint(`${amountToBorrow}`, solSpotMarket.precisionExp));

	const afterLstDeposits = userLstDeposits.add(
		BigNum.fromPrint(`${totalToStake}`, activeLst.spotMarket.precisionExp)
	);

	const hasEmissions = emissionsTokenSymbol && emissionsApr;
	const creationCostMinusDonation =
		accountCreationCost.sub(NEW_ACCOUNT_DONATION);

	return (
		<>
			{/* THE BUG IS SOMEWHERE IN THIS DIV */}
			<div className="w-full p-4 mb-2 space-y-4 bg-container-bg-selected md:space-y-2">
				{/* <SummaryRow>
					<Text.BODY2 className="font-normal">Amount to deposit</Text.BODY2>{' '}
					<Text.BODY2>
						{amountToStake} {activeLst.symbol}
					</Text.BODY2>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">Amount borrowed</Text.BODY2>{' '}
					<ValueChangeDisplay
						previousValue={userSolBorrows.neg().toNum()}
						afterValue={afterSolBorrows.toNum()}
						previousValuePrint={userSolBorrows.neg().toFixed(3)}
						afterValuePrint={afterSolBorrows.toFixed(3)}
						rightSymbol={' SOL'}
					/>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">Your position</Text.BODY2>{' '}
					<ValueChangeDisplay
						previousValue={userLstDeposits.toNum()}
						afterValue={afterLstDeposits.toNum()}
						previousValuePrint={userLstDeposits.toFixed(3)}
						afterValuePrint={afterLstDeposits.toFixed(3)}
						rightSymbol={activeLst.symbol}
					/>
				</SummaryRow>
				<SummaryRow>
					<Text.BODY2 className="font-normal">
						Est. liquidation ratio
					</Text.BODY2>{' '}
					<ValueChangeDisplay
						previousValue={currentLiqRatio}
						afterValue={projectedLiqRatio}
						previousValuePrint={currentLiqRatio.toFixed(3)}
						afterValuePrint={projectedLiqRatio.toFixed(3)}
						rightSymbol={` ${activeLst.symbol}/SOL`}
					/>
				</SummaryRow> */}
				{!hasSuperstakeLstSubaccount && (
					<>
						<SummaryRow>
							<Text.BODY2 className="font-normal">
								New account creation cost
							</Text.BODY2>
							<div>
								<Tooltip
									content={
										<div className="px-2 font-normal">
											<div className="mb-1">
												<Text.BODY1 className="font-normal">
													New Account Fee: {NEW_ACCOUNT_DONATION.toFixed(3)} SOL
												</Text.BODY1>
											</div>
											<div className="mb-3">
												<Text.BODY1 className="font-normal">
													Rent: {creationCostMinusDonation.toFixed(3)} SOL
												</Text.BODY1>
											</div>
											<div className="mb-3">
												<Text.BODY1 className="font-normal">
													Rent is currently higher due to increased user
													activity but can be reclaimed after 13 days when you
													delete your account, or a few hours after you have
													withdrawn all funds.
												</Text.BODY1>
											</div>
											<a
												href="https://docs.drift.trade/creating-a-subaccount"
												target="_blank"
												rel="noreferrer"
												className="flex items-center"
											>
												<Text.BODY1 className="font-normal">
													Learn more{' '}
												</Text.BODY1>
												<Share className="inline-block w-4 h-4 ml-1" />
											</a>
										</div>
									}
									className="flex items-center"
									allowHover
								>
									<Text.BODY2>{accountCreationCost.toFixed(3)} SOL</Text.BODY2>
									<Info size={24} className="relative ml-1 cursor-pointer" />
								</Tooltip>
							</div>
						</SummaryRow>
						{!hasEnoughSolToCreateAccount && solBalance.loaded && (
							<div className="w-full">
								<Text.BODY1 className="font-normal text-text-negative-red">
									You must have at least{' '}
									{accountCreationCost.add(MIN_LEFTOVER_SOL).toFixed(3)} SOL to
									cover account creation and transaction fees.
								</Text.BODY1>
								<br />
								<Text.BODY1 className="font-normal text-text-negative-red">
									Wallet Balance: {solBalance.value.toFixed(3)} SOL
								</Text.BODY1>
							</div>
						)}
					</>
				)}
			</div>

			<div
				className="w-full p-4 mb-2 space-y-4 cursor-pointer bg-container-bg-selected md:space-y-2"
				onClick={toggleAprExpanded}
			>
				<SummaryRow>
					<div className="flex flex-row items-center">
						<Text.BODY2 className="mr-2 font-normal">
							Projected APR (Net)
						</Text.BODY2>{' '}
						<Chevron open={aprExpanded} />
					</div>
					<div className="w-full text-right md:w-auto">
						<Text.BODY2
							className={
								projectedApr > 0 && projectedApr > unleveragedApr
									? 'text-text-positive-green'
									: ''
							}
						>
							{projectedApr.toFixed(2)}%
						</Text.BODY2>
						<div
							className={twMerge(
								`overflow-hidden transition-[all] duration-300 ease-in-out`,
								aprExpanded ? 'mt-2 max-h-[300px]' : 'max-h-0' // 300px is arbitrarily large enough to show all content
							)}
						>
							<Text.BODY1 className="font-normal">
								{activeLst.symbol} APR:{' '}
								<span className="font-bold text-text-positive-green">
									{lstApr.toFixed(2)}%
								</span>{' '}
								<br />
								{hasEmissions && (
									<>
										{emissionsTokenSymbol} Rewards APR:{' '}
										<span className="font-bold text-text-positive-green">
											{emissionsApr.toFixed(2)}%
										</span>{' '}
										<br />
									</>
								)}
								{activeLst.symbol} Deposit APR:{' '}
								{lstDepositRate === 0 ? (
									<span>0%</span>
								) : lstDepositRate > 0 ? (
									<span className="font-bold text-text-positive-green">
										{lstDepositRate.toFixed(2)}%
									</span>
								) : (
									<span className="font-bold text-text-negative-red">
										{lstDepositRate.toFixed(2)}%
									</span>
								)}
								<br />
								SOL Borrow APR:{' '}
								{solBorrowRate === 0 ? (
									<span>0%</span>
								) : -1 * solBorrowRate > 0 ? (
									<span className="font-bold text-text-positive-green">
										{solBorrowRate.toFixed(2)}%
									</span>
								) : (
									<span className="font-bold text-text-negative-red">
										{solBorrowRate.toFixed(2)}%
									</span>
								)}
							</Text.BODY1>
						</div>
					</div>
				</SummaryRow>

				{amountToStake !== 0 &&
					projectedApr < unleveragedApr &&
					leverageToUse > 1 && (
						<div className="flex flex-row items-center justify-between w-[80%]">
							<div className="mr-4">
								<ExclamationTriangleIcon className="w-8 h-8" />
							</div>
							<Text.BODY1 className="font-normal">
								Based on the current SOL borrow rate, you can achieve a better
								projected APR by reducing your leverage.
							</Text.BODY1>
						</div>
					)}
			</div>
		</>
	);
};

export default React.memo(StakeFormSummary);
