'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../Button';
import Text from '../Text';
import CollateralInput from '../CollateralInput';
import { BASE_PRECISION_EXP, BigNum, BN, SpotMarkets } from '@drift-labs/sdk';
import useAppStore from '../../hooks/useAppStore';
import useSPLTokenBalance from '../../hooks/useSPLTokenBalance';
import Slider from '../Slider';
import StakeFormSummary from './StakeFormSummary';
import ConnectWalletButton from '../ConnectWalletButton';
import { PublicKey } from '@solana/web3.js';
import { useAppActions } from '../../hooks/useAppActions';
import UnstakeSummary from './UnstakeSummary';
import useCurrentSuperstakePosition from '../../hooks/useCurrentSuperstakePosition';
import WithdrawStakeSummary from './WithdrawStakeSummary';
import useBorrowAmountForStake from '../../hooks/useBorrowAmountForStake';
import useEstimateApr from '../../hooks/useEstimateApr';
import useMaxSwapAmount from '../../hooks/useMaxSwapAmount';
import useEstimatedLiquidationRatio from '../../hooks/useCurrentLiquidationRatio';
import useSwapSlippageTolerance from '../../hooks/useSwapSlippageTolerance';
import SlippageTolerance from '../SlippageTolerance';
import { SLIPPAGE_TOLERANCE_DEFAULT } from '../../constants';
import { SOL_PRECISION_EXP } from '../../utils/uiUtils';
import { twMerge } from 'tailwind-merge';
import { ChevronRight } from '@drift-labs/icons';
import { useAccountCreationCost, useCommonDriftStore } from '@drift-labs/react';
import { useWallet } from '@drift-labs/react';
import useCurrentLstMetrics from '../../hooks/useCurrentLstMetrics';
import { useHasSuperstakeLstSubaccount } from '../../hooks/useHasSuperstakeLstSubaccount';
import Checkbox from '../Checkbox';
import useMaxLeverageForLst from '../../hooks/useMaxLeverageForLst';

const UnstakeSteps = ({
	highlightedStep,
	lstSymbol,
}: {
	highlightedStep: number;
	lstSymbol: string;
}) => {
	return (
		<div className="flex flex-col items-center w-full p-3 mb-4 md:flex-row bg-container-bg-selected">
			<div
				className={twMerge([
					'flex-grow text-center',
					highlightedStep === 1 ? 'opacity-50' : 0,
				])}
			>
				<div>
					<Text.BODY2>Step 1: Repay Borrow</Text.BODY2>
				</div>
			</div>
			<div className="hidden px-4 md:block">
				<ChevronRight className="relative top-[2px]" />
			</div>
			<div
				className={twMerge([
					'flex-grow text-center',
					highlightedStep === 0 ? 'opacity-50' : 0,
				])}
			>
				<Text.BODY2>Step 2: Withdraw {lstSymbol}</Text.BODY2>
			</div>
		</div>
	);
};

const MAX_DEPOSIT_AMOUNT = 50000;

type Tab = 'stake' | 'unstake';

const StakeUnstakeForm = () => {
	const [advancedMode, setAdvancedMode] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const actions = useAppActions();
	const connected = useWallet().connected;
	const setStoreState = useAppStore((s) => s.set);
	const activeLst = useAppStore((s) => s.activeLst);
	const currentUserAccountLoaded = useAppStore(
		(s) => s.currentUserAccount.loaded
	);
	const driftEnv = useCommonDriftStore((s) => s.env.driftEnv);
	const lstSpotMarket = activeLst.spotMarket;
	const solSpotMarket = (
		SpotMarkets[driftEnv] || SpotMarkets['mainnet-beta']
	).find((market) => market.symbol === 'SOL');

	const [selectedTab, setSelectedTab] = useState<Tab>('stake');
	const { swapSlippageTolerance, setSwapSlippageTolerance } =
		useSwapSlippageTolerance();

	const hasSuperstakeLstSubaccount = useHasSuperstakeLstSubaccount();
	const [hasAcceptedAccountCreationFee, setHasAcceptedAccontCreationFee] =
		useState(false);

	const { accountCreationCost } = useAccountCreationCost();
	const solBalance = useCommonDriftStore((s) => s.currentSolBalance);
	const hasEnoughSolToCreateAccount =
		solBalance.loaded && solBalance.value.gte(accountCreationCost);

	// other values in app store
	const { solBorrowCapacityRemaining } = useAppStore((s) => s.spotMarketData);

	const {
		amountToUnstakeString,
		amountToStakeString,
		amountToStakeUncappedString,
		isMaxStake,
		leverageToUse,
		unstakeLeverage,
		isMaxUnstake,
	} = useAppStore((s) => s.stakeUnstakeForm);

	const lstMetrics = useCurrentLstMetrics();

	const maxLeverageForLst = useMaxLeverageForLst(activeLst);
	const maxLeverage = maxLeverageForLst.maxLeverage;
	const lastMaxLeverageLoaded = useRef<boolean>(false);
	const lastLst = useRef<string>('');

	const currentSubAccountId = useAppStore(
		(s) => s.currentUserAccount?.accountId
	);

	const {
		hasOpenPosition,
		userLstEquity,
		userLstLeverage,
		userLstDeposits,
		userSolDeposits,
		userSolBorrows,
	} = useCurrentSuperstakePosition();

	const amountToStakeNum = parseFloat(amountToStakeUncappedString) || 0;

	const userLstEquityBigNum = BigNum.fromPrint(
		`${userLstEquity.value}`,
		activeLst.spotMarket.precisionExp
	);

	// If target leverage is greater tham current leverage, make them withdraw before repaying any borrows
	// This keeps the cycle of repay borrow -> withdraw in the correct order
	const canWithdrawWithoutRepay =
		(unstakeLeverage || 0) >= userLstLeverage || !hasOpenPosition;

	const customUnstakeAmount = canWithdrawWithoutRepay
		? 0
		: parseFloat(amountToUnstakeString);

	const amountToUnstakeNum = advancedMode
		? isNaN(customUnstakeAmount) || canWithdrawWithoutRepay
			? 0
			: customUnstakeAmount
		: userLstEquity.value;

	const advancedModeTargetBorrow = useBorrowAmountForStake({
		lstAmount: userLstEquity.value - customUnstakeAmount,
		leverage: unstakeLeverage || userLstLeverage || 0,
	});

	// We have to keep these two paths split up because of not being able to swap + withdraw in one tx
	// Otherwise user ends up in sort of a "recursive loop" of continuously trying to change their stake but never being able to withdraw
	let amountToWithdrawWithoutRepay = 0;
	let unstakeBorrowChangeAmount =
		isNaN(amountToUnstakeNum) || amountToUnstakeNum === 0
			? 0
			: userSolBorrows.toNum();

	if (canWithdrawWithoutRepay && unstakeLeverage) {
		const userBorrowsLstValue =
			userSolBorrows.abs().toNum() / (lstMetrics?.priceInSol || 1);

		// Solving for "your stake" and just withdrawing without changing any value except the leverage
		amountToWithdrawWithoutRepay =
			userLstEquity.value - userBorrowsLstValue / (unstakeLeverage - 1);
	} else if (advancedMode && amountToUnstakeNum > 0) {
		// Solving for borrow amount change
		unstakeBorrowChangeAmount =
			-1 * (userSolBorrows.abs().toNum() - advancedModeTargetBorrow);
	}

	const unstakeLstPosition =
		canWithdrawWithoutRepay ||
		isNaN(amountToUnstakeNum) ||
		amountToUnstakeNum === 0
			? userLstDeposits.toNum() - amountToWithdrawWithoutRepay
			: (userLstEquity.value - amountToUnstakeNum) *
			  (unstakeLeverage ?? userLstLeverage ?? 0);

	const unstakeLiqRatio = useEstimatedLiquidationRatio({
		lstAmount: unstakeLstPosition,
		solAmount: userSolBorrows.abs().toNum() + unstakeBorrowChangeAmount,
	});

	// for STAKE
	let solBorrowAmount = useBorrowAmountForStake({
		lstAmount: amountToStakeNum,
		leverage: leverageToUse,
	});

	const { maxSolSwap, maxLstSwap } = useMaxSwapAmount(amountToStakeNum);

	solBorrowAmount = Math.min(
		solBorrowAmount,
		maxSolSwap ? maxSolSwap * 0.99 : solBorrowAmount
	);
	const totalStakeSize = Math.min(
		amountToStakeNum * leverageToUse,
		maxLstSwap
			? maxLstSwap * 0.99 + amountToStakeNum
			: amountToStakeNum * leverageToUse
	);

	const currentLiqRatio = useEstimatedLiquidationRatio({
		lstAmount: userLstDeposits.toNum(),
		solAmount: userSolBorrows.abs().toNum(),
	});

	const {
		leveragedLstApr,
		leveragedEmissionsApr,
		leveragedBorrowRate,
		leveragedDepositRate,
		// lstDepositRate,
		totalNetProjectedApr,
		projectedLiqRatio,
		unleveragedApr,
	} = useEstimateApr({
		lstAmount: totalStakeSize + userLstDeposits.toNum(),
		solAmount: solBorrowAmount + userSolBorrows.neg().toNum(),
		includeBorrowRateDelta: true,
	});

	const precision = lstSpotMarket?.precisionExp || BASE_PRECISION_EXP;
	const lstBalance = useSPLTokenBalance(
		lstSpotMarket?.mint?.toString() || '',
		precision
	);

	if (!connected) {
		lstBalance.balance = 0;
		lstBalance.balanceBigNum = new BigNum(0, precision);
		lstBalance.balanceLoaded = true;
		lstBalance.tokenAccountAddress = '';
	}

	const exceedsMax = amountToStakeNum > lstBalance.balance;

	const exceedsMaxBorrow =
		solBorrowCapacityRemaining?.lteZero() && solBorrowAmount > 0;

	const handleChangeStakeAmount = useCallback((value: string | undefined) => {
		let valueOrZero = value ?? '0';

		const parsedVal = parseFloat(valueOrZero);

		if (parsedVal > MAX_DEPOSIT_AMOUNT) {
			valueOrZero = `${MAX_DEPOSIT_AMOUNT}`;
		}

		// Thoguht this would need to be 10 ^ -9 (typical LST spot precision) but BigNum breaks at -7 for some reason
		if (parsedVal !== 0 && parsedVal < Math.pow(10, -6)) {
			valueOrZero = '0';
		}

		setStoreState((s) => {
			s.stakeUnstakeForm.amountToStakeString = valueOrZero;
			s.stakeUnstakeForm.amountToStakeUncappedString = valueOrZero;
		});
	}, []);

	const handleMaxStake = useCallback(() => {
		setStoreState((s) => {
			s.stakeUnstakeForm.isMaxStake = true;
			s.stakeUnstakeForm.amountToStakeString =
				lstBalance.balanceBigNum.toTradePrecision();
			s.stakeUnstakeForm.amountToStakeUncappedString =
				lstBalance.balanceBigNum.toTradePrecision();
		});
	}, [lstBalance.balance]);

	const handleChangeLeverage = useCallback((value: number | number[]) => {
		let val: number;
		if (value instanceof Array) {
			val = value[0];
		} else {
			val = value;
		}

		setStoreState((s) => {
			s.stakeUnstakeForm.leverageToUse = val;
		});
	}, []);

	const handleSuperStakeDeposit = async () => {
		if (
			!lstSpotMarket ||
			!solSpotMarket ||
			!lstSpotMarket?.mint ||
			!lstBalance.tokenAccountAddress ||
			exceedsMax
		) {
			return;
		}

		const fromTokenAccount = new PublicKey(lstBalance.tokenAccountAddress);

		setSubmitting(true);

		try {
			await actions.handleSuperStakeDeposit({
				lstDepositAmount: BigNum.fromPrint(
					`${amountToStakeNum}`,
					lstSpotMarket.precisionExp
				).val,
				solBorrowAmount: BigNum.fromPrint(
					`${solBorrowAmount}`,
					solSpotMarket.precisionExp
				).val,
				fromTokenAccount,
				lstSolPrice: lstMetrics.priceInSol,
				lst: activeLst,
			});
		} catch (err) {
			console.log(err);
		}

		setStoreState((s) => {
			s.stakeUnstakeForm.amountToStakeString = '';
			s.stakeUnstakeForm.amountToStakeUncappedString = '';
		});

		setSubmitting(false);
	};

	const handleSuperStakeWithdrawal = async () => {
		if (!lstSpotMarket || !solSpotMarket || currentSubAccountId === undefined) {
			return;
		}

		setSubmitting(true);

		try {
			// Need to repay a tiny bit extra here to cover interest earned while approving tx, maybe 0.01? 0.001?
			// It's reduce only anyway so shouldn't matter how much really, we'll go bigger than needed:
			const withdrawalBufferLst = BigNum.fromPrint(
				'0.1',
				lstSpotMarket.precisionExp
			);

			const isPartialUnstakeWithdraw =
				canWithdrawWithoutRepay && hasOpenPosition;

			const lstWithdrawalAmount = isPartialUnstakeWithdraw
				? BigNum.fromPrint(
						`${amountToWithdrawWithoutRepay}`,
						lstSpotMarket.precisionExp
				  ).val
				: userLstDeposits.add(withdrawalBufferLst).val;

			const withdrawalBufferSol = BigNum.fromPrint(
				'0.1',
				solSpotMarket.precisionExp
			);
			const solWithdrawalAmount = isPartialUnstakeWithdraw
				? new BN(0, SOL_PRECISION_EXP.toNumber())
				: userSolDeposits.add(withdrawalBufferSol).val;

			await actions.handleSuperStakeWithdrawal({
				lstWithdrawalAmount,
				solWithdrawalAmount,
				subAccountId: currentSubAccountId,
			});
		} catch (err) {
			console.log(err);
		}

		setSubmitting(false);
	};

	const handleSuperStakeRepayBorrow = async () => {
		if (
			!hasOpenPosition ||
			!lstSpotMarket ||
			!solSpotMarket ||
			!amountToUnstakeNum ||
			isNaN(unstakeBorrowChangeAmount) ||
			currentSubAccountId === undefined
		) {
			return;
		}

		// If user dfidn't change leverage, store what their last lev was in the form state before repaying borrow
		if (!unstakeLeverage && advancedMode) {
			setStoreState((s) => {
				s.stakeUnstakeForm.unstakeLeverage = userLstLeverage;
			});
		}

		setSubmitting(true);

		try {
			// Need to repay a tiny bit extra sol here to cover interest earned while approving tx, maybe 0.01? 0.001?
			let solSwapOutAmount: BN;
			if (isMaxUnstake || !advancedMode) {
				solSwapOutAmount = userSolBorrows
					.neg()
					.val.mul(new BN(1001))
					.div(new BN(1000));
			} else {
				solSwapOutAmount = BigNum.fromPrint(
					`${unstakeBorrowChangeAmount}`,
					SOL_PRECISION_EXP
				).neg().val;
			}

			await actions.handleSuperStakeRepayBorrow({
				subAccountId: currentSubAccountId,
				solSwapOutAmount,
				slippageBps: swapSlippageTolerance && swapSlippageTolerance * 100,
			});

			setStoreState((s) => {
				s.stakeUnstakeForm.amountToUnstakeString = '';
			});
		} catch (err) {
			console.log(err);
		}

		setSubmitting(false);
	};

	const handleChangeSlippageTolerance = (newValue: number) => {
		if (newValue > 0) {
			setSwapSlippageTolerance(newValue);
		} else {
			setSwapSlippageTolerance(SLIPPAGE_TOLERANCE_DEFAULT);
		}
	};

	const handleChangeFormMode = () => {
		setAdvancedMode(!advancedMode);
	};

	const handleChangeUnstakeLeverage = useCallback(
		(value: number | number[]) => {
			let val: number;
			if (value instanceof Array) {
				val = value[0];
			} else {
				val = value;
			}

			setStoreState((s) => {
				s.stakeUnstakeForm.unstakeLeverage = val;
			});
		},
		[]
	);

	const handleChangeUnstakeAmount = (value: string | undefined) => {
		let isMaxUnstake = false;
		let valueOrZero = value ?? '0';
		const parsedVal = parseFloat(valueOrZero);
		if (parsedVal >= userLstEquity?.value) {
			isMaxUnstake = true;
			valueOrZero = `${userLstEquity?.value}`;
		}
		if (parsedVal !== 0 && parsedVal < Math.pow(10, -6)) {
			valueOrZero = '0';
		}
		setStoreState((s) => {
			s.stakeUnstakeForm.amountToUnstakeString = valueOrZero;
			s.stakeUnstakeForm.isMaxUnstake = isMaxUnstake;
		});
	};

	const handleMaxUnstake = () => {
		// reset leverage to default
		setStoreState((s) => {
			s.stakeUnstakeForm.unstakeLeverage = undefined;
			s.stakeUnstakeForm.amountToUnstakeString = `${userLstEquity?.value}`;
			s.stakeUnstakeForm.isMaxUnstake = true;
		});
	};

	const handleResetUnstakeLeverage = () => {
		setStoreState((s) => {
			s.stakeUnstakeForm.isMaxUnstake = false;
			s.stakeUnstakeForm.unstakeLeverage = undefined;
			s.stakeUnstakeForm.amountToUnstakeString = '';
		});
	};

	// Handle capping at max if user typed in a greater value
	useEffect(() => {
		const floatVal = parseFloat(amountToStakeString);
		const exceedsMax = floatVal > lstBalance.balance;
		if (exceedsMax) {
			setStoreState((s) => {
				s.stakeUnstakeForm.isMaxStake = true;
			});
		} else if (!exceedsMax) {
			setStoreState((s) => {
				s.stakeUnstakeForm.isMaxStake = false;
			});
		}
	}, [amountToStakeString, isMaxStake, lstBalance.balance]);

	// Set current leverage to half way along the slider if:
	// - max leverage went from not loaded to loaded
	// - active lst changed
	useEffect(() => {
		if (
			(lastMaxLeverageLoaded.current === false &&
				maxLeverageForLst.loaded === true) ||
			lastLst.current !== activeLst.symbol
		) {
			const defaultLeverage =
				1 + Math.floor((10 * (maxLeverageForLst.maxLeverage - 1)) / 2) / 10;
			setStoreState((s) => {
				s.stakeUnstakeForm.leverageToUse = defaultLeverage;
			});
			lastMaxLeverageLoaded.current = true;
			lastLst.current = activeLst.symbol;
		}
	}, [
		maxLeverageForLst,
		lastMaxLeverageLoaded.current,
		lastLst.current,
		activeLst,
	]);

	return (
		<div className="flex flex-col justify-between h-full">
			{/* TABS */}
			<div>
				<div className="flex flex-row items-center justify-center mb-8">
					<Button
						className="rounded-r-none border-r-[1px]"
						outerClassName={'rounded-r-none'}
						selected={selectedTab === 'stake'}
						onClick={() => setSelectedTab('stake')}
					>
						<Text.BODY3>Stake</Text.BODY3>
					</Button>
					<Button
						className="rounded-l-none border-l-[1px]"
						outerClassName={'rounded-l-none'}
						selected={selectedTab === 'unstake'}
						onClick={() => setSelectedTab('unstake')}
					>
						<Text.BODY3>Unstake</Text.BODY3>
					</Button>
				</div>

				{selectedTab === 'stake' ? (
					<>
						<CollateralInput
							maxAmount={lstBalance.balanceBigNum}
							lstSymbol={activeLst.symbol}
							onChange={handleChangeStakeAmount}
							label={'Amount to stake'}
							value={amountToStakeUncappedString}
							onMax={handleMaxStake}
							placeholder={'0'}
							maxLoading={!lstBalance.balanceLoaded}
						/>
						<div className="mt-2">
							<Text.BODY3 className="text-text-label">
								Select your leverage:{' '}
								{maxLeverageForLst.loaded && (
									<span className="text-text-default">{leverageToUse}x</span>
								)}
							</Text.BODY3>
						</div>

						<div className="mt-3 mb-8 rc-slider-custom">
							<Slider
								onDrop={handleChangeLeverage}
								onMove={handleChangeLeverage}
								value={leverageToUse}
								step={0.1}
								min={1}
								max={maxLeverage}
							/>
						</div>

						<StakeFormSummary
							amountToStake={isNaN(amountToStakeNum) ? 0 : amountToStakeNum}
							amountToBorrow={solBorrowAmount}
							totalToStake={isNaN(amountToStakeNum) ? 0 : totalStakeSize}
							currentLiqRatio={isNaN(currentLiqRatio) ? 0 : currentLiqRatio}
							projectedLiqRatio={
								isNaN(amountToStakeNum) || amountToStakeNum === 0
									? isNaN(currentLiqRatio)
										? 0
										: currentLiqRatio
									: isNaN(projectedLiqRatio)
									  ? 0
									  : projectedLiqRatio
							}
							projectedApr={
								isNaN(totalNetProjectedApr) ? 0 : totalNetProjectedApr
							}
							unleveragedApr={isNaN(unleveragedApr) ? 0 : unleveragedApr}
							lstApr={isNaN(leveragedLstApr) ? 0 : leveragedLstApr}
							emissionsApr={
								isNaN(leveragedEmissionsApr) ? 0 : leveragedEmissionsApr
							}
							solBorrowRate={
								isNaN(leveragedBorrowRate) ? 0 : leveragedBorrowRate
							}
							lstDepositRate={
								isNaN(leveragedDepositRate) ? 0 : leveragedDepositRate
							}
							emissionsTokenSymbol={activeLst.emissionsTokenSymbol}
							leverageToUse={leverageToUse}
						/>
					</>
				) : (
					<>
						<div className="flex flex-row items-start w-full space-between">
							<div className="flex-grow">
								<Text.BODY2>
									Amount to unstake:{' '}
									{!advancedMode && (
										<button
											className="ml-2 underline text-text-label"
											onClick={handleChangeFormMode}
										>
											edit
										</button>
									)}
								</Text.BODY2>

								<Text.H3
									className={twMerge([
										'transition-all',
										userLstEquity.value > 0 ? '' : 'text-text-label',
										advancedMode ? 'text-lg' : '',
									])}
								>
									{userLstEquity.value.toFixed(3)} {activeLst.symbol}
								</Text.H3>
							</div>
							{advancedMode && (
								<div className="flex flex-row items-start">
									<button className="mr-3" onClick={handleResetUnstakeLeverage}>
										<Text.BODY1 className="underline">reset</Text.BODY1>
									</button>
									<button onClick={handleChangeFormMode}>
										<Text.BODY1 className="underline text-text-negative-red">
											cancel
										</Text.BODY1>
									</button>
								</div>
							)}
						</div>

						<div
							className={twMerge([
								'my-4 overflow-hidden max-h-0 transition-all',
								advancedMode ? 'max-h-[230px]' : '',
							])}
						>
							<CollateralInput
								disabled={!hasOpenPosition || canWithdrawWithoutRepay}
								maxAmount={userLstEquityBigNum}
								lstSymbol={activeLst.symbol}
								onChange={handleChangeUnstakeAmount}
								label={'Amount to unstake'}
								value={canWithdrawWithoutRepay ? '' : amountToUnstakeString}
								onMax={handleMaxUnstake}
								placeholder={'0'}
								maxLoading={!userLstEquity.loaded}
								showBuyButton={false}
							/>
							<div>
								<Text.BODY3 className="mt-2 text-text-label">
									Target leverage:{' '}
									<span className="text-text-default">
										{isMaxUnstake
											? 0
											: +unstakeLeverage
											  ? unstakeLeverage?.toFixed(4)
											  : userLstLeverage?.toFixed(4)}
										x {unstakeLeverage === userLstLeverage && ' (current)'}
									</span>
								</Text.BODY3>
							</div>
							<div className="px-4 mt-3 mb-8 rc-slider-custom">
								<Slider
									disabled={!hasOpenPosition || isMaxUnstake || submitting}
									onDrop={handleChangeUnstakeLeverage}
									onMove={handleChangeUnstakeLeverage}
									value={
										!hasOpenPosition || isMaxUnstake
											? 0
											: unstakeLeverage || userLstLeverage || 2
									}
									step={0.1}
									min={1}
									max={maxLeverage}
								/>
							</div>
						</div>

						<div>
							<SlippageTolerance
								value={swapSlippageTolerance ?? SLIPPAGE_TOLERANCE_DEFAULT}
								onChange={handleChangeSlippageTolerance}
							/>
						</div>

						<div className="mt-6">
							{hasOpenPosition ? (
								<UnstakeSummary
									amountToUnstake={
										isNaN(amountToUnstakeNum) ? 0 : amountToUnstakeNum
									}
									currentTotalStake={userLstDeposits.toNum()}
									newTotalStake={unstakeLstPosition}
									currentSolBorrow={userSolBorrows.toNum()}
									amountToRepay={
										isNaN(unstakeBorrowChangeAmount)
											? 0
											: unstakeBorrowChangeAmount
									}
									currentLeverage={userLstLeverage}
									newLeverage={
										isMaxUnstake || !advancedMode
											? 0
											: (unstakeLeverage || userLstLeverage) ?? 0
									}
									currentLiqRatio={
										isNaN(currentLiqRatio) || !currentLiqRatio
											? 0
											: currentLiqRatio
									}
									newLiqRatio={
										isMaxUnstake || !advancedMode ? 0 : unstakeLiqRatio
									}
									lstSymbol={activeLst.symbol}
								/>
							) : (
								<WithdrawStakeSummary
									amountToWithdrawSol={userSolDeposits.toNum()}
									amountToWithdrawLst={userLstDeposits.toNum()}
									lstSymbol={activeLst.symbol}
								/>
							)}
						</div>
					</>
				)}
			</div>

			{selectedTab === 'stake' ? (
				<div className="mt-6">
					{connected ? (
						<div>
							<div
								className="flex space-x-4 pl-4 cursor-pointer items-center mb-6"
								onClick={() =>
									setHasAcceptedAccontCreationFee(
										!hasAcceptedAccountCreationFee
									)
								}
							>
								<div>
									<Checkbox
										className="relative"
										checked={hasAcceptedAccountCreationFee}
										onChange={() =>
											setHasAcceptedAccontCreationFee(
												!hasAcceptedAccountCreationFee
											)
										}
									/>
								</div>
								<Text.BODY1>
									I understand that dynamic account creation fees are in place
									as a safe guard and that rent can be reclaimed upon account
									deletion.
								</Text.BODY1>
							</div>
							<Button
								className="w-full"
								onClick={handleSuperStakeDeposit}
								disabled={
									!amountToStakeString ||
									amountToStakeNum === 0 ||
									isNaN(amountToStakeNum) ||
									submitting ||
									exceedsMax ||
									exceedsMaxBorrow ||
									!currentUserAccountLoaded ||
									(!hasSuperstakeLstSubaccount &&
										(!hasAcceptedAccountCreationFee ||
											!hasEnoughSolToCreateAccount))
								}
							>
								{submitting ? (
									'Approving Transaction...'
								) : amountToStakeNum && exceedsMaxBorrow ? (
									<Text.H5>Full Capacity Reached</Text.H5>
								) : exceedsMax ? (
									<Text.H5>Insufficient {activeLst.symbol} balance</Text.H5>
								) : (
									<Text.H5>
										Super Stake {amountToStakeString} {activeLst.symbol}
									</Text.H5>
								)}
							</Button>
						</div>
					) : (
						<ConnectWalletButton />
					)}
				</div>
			) : (
				<div className="mt-6">
					{connected ? (
						hasOpenPosition ? (
							canWithdrawWithoutRepay && advancedMode ? (
								<>
									<UnstakeSteps
										highlightedStep={1}
										lstSymbol={activeLst.symbol}
									/>
									<Button
										className="w-full"
										onClick={handleSuperStakeWithdrawal}
										disabled={
											!amountToWithdrawWithoutRepay ||
											submitting ||
											!currentUserAccountLoaded
										}
									>
										{submitting ? (
											'Approving Transaction...'
										) : (
											<Text.H5>
												Withdraw {amountToWithdrawWithoutRepay.toFixed(3) || 0}{' '}
												{activeLst.symbol}
											</Text.H5>
										)}
									</Button>
								</>
							) : (
								<>
									<UnstakeSteps
										highlightedStep={0}
										lstSymbol={activeLst.symbol}
									/>
									<Button
										className="w-full"
										onClick={handleSuperStakeRepayBorrow}
										disabled={
											!amountToUnstakeNum ||
											submitting ||
											!currentUserAccountLoaded
										}
									>
										{submitting ? (
											'Approving Transaction...'
										) : (
											<Text.H5>
												Unstake {amountToUnstakeNum.toFixed(3)}{' '}
												{activeLst.symbol}
											</Text.H5>
										)}
									</Button>
								</>
							)
						) : (
							<>
								<UnstakeSteps
									highlightedStep={1}
									lstSymbol={activeLst.symbol}
								/>
								<Button
									className="w-full"
									onClick={handleSuperStakeWithdrawal}
									disabled={
										!userLstDeposits?.toNum() ||
										submitting ||
										!currentUserAccountLoaded
									}
								>
									{submitting ? (
										'Approving Transaction...'
									) : (
										<Text.H5>
											Withdraw {userLstDeposits?.toNum() || 0}{' '}
											{activeLst.symbol}
										</Text.H5>
									)}
								</Button>
							</>
						)
					) : (
						<ConnectWalletButton />
					)}
				</div>
			)}
		</div>
	);
};

export default React.memo(StakeUnstakeForm);
