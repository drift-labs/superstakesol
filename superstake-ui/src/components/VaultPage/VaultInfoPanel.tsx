import React, { ReactNode, useEffect, useRef, useState } from "react";
import Text from "../Text";
import ChevronLeftIcon from "@heroicons/react/24/solid/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/solid/ArrowTopRightOnSquareIcon";
import { BigNum, SpotMarkets, SpotMarketConfig } from "@drift-labs/sdk";
import useAppStore from "../../hooks/useAppStore";
import useCurrentSuperstakePosition from "../../hooks/useCurrentSuperstakePosition";
import useEstimateApr from "../../hooks/useEstimateApr";
import useBorrowAmountForStake from "../../hooks/useBorrowAmountForStake";
import { format } from "timeago.js";
import useUserSolEarned from "../../hooks/useUserSolEarned";
import Tooltip from "../Tooltip";
import { Info } from "@drift-labs/icons";
import EpochEndingDisplay from "../EpochEndingDisplay";
import { useCommonDriftStore } from "@drift-labs/react";
import useCurrentLstMetrics from "../../hooks/useCurrentLstMetrics";
import Skeleton from "react-loading-skeleton";

const Bubble = ({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`w-3 h-3 border-container-border border-2 rounded cursor-pointer ${
        selected ? "gradient-slider-bg" : ""
      }`}
      onClick={onClick}
    />
  );
};

const TextWithSkeleton = ({
  loading,
  value,
  isAuthorityValue,
}: {
  loading?: boolean;
  value: string | number | ReactNode;
  isAuthorityValue?: boolean;
}) => {
  const authority = useCommonDriftStore((s) => s.authority);

  return loading && (isAuthorityValue ? authority : true) ? (
    <Skeleton height={38} />
  ) : (
    <Text.H4>{value}</Text.H4>
  );
};

const VaultOverviewPanel = () => {
  const activeLst = useAppStore(s => s.getActiveLst());
  const lstAmount = 100;
  const leverage = activeLst.maxLeverage ?? 3;
  const solAmount = useBorrowAmountForStake({
    lstAmount,
    leverage,
  });
  const {
    projectedApr,
    unleveragedApr,
    loaded: isAprLoaded,
  } = useEstimateApr({
    lstAmount: lstAmount * leverage,
    solAmount,
  });

  const maxAprPercentage = Math.max(projectedApr, unleveragedApr);

  const {
    tvl,
    solBorrowCapacityRemaining: solBorrowCapacityRemaining,
    percentOfCapUsed,
    tvlLoaded,
    loaded: isSpotMarketLoaded,
  } = useAppStore((s) => s.spotMarketData);

  return (
    <div className="w-full pr-2 shrink-0">
      <div className="mt-8">
        <Text.BODY3>Earn up to</Text.BODY3>

        <div>
          <TextWithSkeleton
            value={
              <>
                {`${maxAprPercentage.toFixed(2)}% APR`}
                <Tooltip
                  content={
                    <>
                      <div>
                        Based on staking 100 {activeLst.symbol} at{" "}
                        {projectedApr > unleveragedApr ? `${leverage}x` : "1x"} leverage
                      </div>
                    </>
                  }
                  placement="top"
                >
                  <Info
                    size={24}
                    className="relative ml-2 cursor-pointer top-0.5"
                  />
                </Tooltip>
              </>
            }
            loading={!isAprLoaded}
          />
        </div>
      </div>

      <div className="mt-8">
        <Text.BODY3>Max. leverage</Text.BODY3>
        <Text.H4>{leverage}x</Text.H4>
      </div>

      <div className="mt-8">
        <Text.BODY3>Total staked</Text.BODY3>
        <TextWithSkeleton
          value={`${tvl[activeLst.symbol].prettyPrint(true)} ${activeLst.symbol}`}
          loading={!tvlLoaded}
        />
      </div>

      <div className="mt-8">
        <Text.BODY3>Remaining borrow capacity</Text.BODY3>
        <TextWithSkeleton
          value={`${solBorrowCapacityRemaining.prettyPrint(true)} SOL`}
          loading={!isSpotMarketLoaded}
        />
        <div className="relative w-full h-4 mt-2 overflow-hidden border-2 rounded border-container-border">
          <div
            className="absolute right-0 w-full h-4 border-r-2 border-container-border gradient-slider-bg"
            style={{
              right: `${100 - percentOfCapUsed}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const YourStakePanel = () => {
  const lstMetrics = useCurrentLstMetrics();
  const activeLst = useAppStore((s) => s.activeLst);
  const currentUserAccount = useAppStore((s) => s.currentUserAccount);

  const {
    userLstEquity,
    userLstDeposits,
    userSolBorrows: yourSolBorrow,
    userLstLeverage: yourLeverage,
    loaded: isPositionLoaded,
  } = useCurrentSuperstakePosition();

  const {
    projectedApr: yourAprPercentage,
    projectedLiqRatio: estLiquidationRatio,
    loaded: isAprLoaded,
  } = useEstimateApr({
    lstAmount: userLstDeposits.toNum(),
    solAmount: yourSolBorrow.abs().toNum(),
  });

  const { solEarned: yourTotalEarnedValue, loaded: isSolEarnedLoaded } =
    useUserSolEarned();

  const getLoadingState = (condition: boolean) => {
    return (
      !currentUserAccount.loaded || (!!currentUserAccount.user && condition)
    );
  };

  return (
    <div className="w-full pr-2 shrink-0">
      <div className="flex flex-col items-start w-full mt-8 space-y-6 md:flex-row md:space-y-0 space-between">
        <div className="flex-grow w-full md:w-[50%] pr-4">
          <Text.BODY3>Your stake</Text.BODY3>
          <TextWithSkeleton
            value={`${userLstEquity.value?.toFixed(3)} ${activeLst}`}
            loading={getLoadingState(!userLstEquity.loaded)}
            isAuthorityValue
          />
        </div>

        <div className="flex-grow w-full md:w-[50%]">
          <Text.BODY3>Your position</Text.BODY3>
          <TextWithSkeleton
            value={`${userLstDeposits.toFixed(3)} ${activeLst}`}
            loading={getLoadingState(!isPositionLoaded)}
            isAuthorityValue
          />
        </div>
      </div>

      <div className="flex flex-col items-start w-full mt-8 space-y-6 md:flex-row md:space-y-0 space-between">
        <div className="flex-grow w-full md:w-[50%] pr-4">
          <Text.BODY3>Your est. APR</Text.BODY3>
          <div>
            <TextWithSkeleton
              value={`${
                isNaN(yourAprPercentage) ? 0 : yourAprPercentage.toFixed(2)
              }% APR`}
              loading={getLoadingState(
                !isAprLoaded || !isPositionLoaded || !userLstEquity.loaded
              )}
              isAuthorityValue
            />
          </div>
        </div>

        <div className="flex-grow w-full md:w-[50%]">
          <Tooltip
            content={
              <>
                <div>
                  <Text.BODY1 className="font-normal">
                    Rewards are compounded into the value of {activeLst} and
                    update at the end of each epoch. As a result, new positions
                    may show negative earnings as the SOL borrow rate is paid
                    continuously.
                  </Text.BODY1>
                </div>
                <div className="mt-4">
                  <Text.BODY1 className="font-normal">
                    Estimated time remaining in epoch:
                    <div>
                      <EpochEndingDisplay />
                    </div>
                  </Text.BODY1>
                </div>
              </>
            }
            placement="top"
          >
            <Text.BODY3>
              Total earned{" "}
              <Info size={24} className="relative ml-1 cursor-pointer top-1" />
            </Text.BODY3>
          </Tooltip>
          <TextWithSkeleton
            value={`${yourTotalEarnedValue?.prettyPrint(true)} SOL`}
            loading={getLoadingState(!isSolEarnedLoaded || !isPositionLoaded)}
            isAuthorityValue
          />
        </div>
      </div>

      <div className="flex flex-col items-start w-full mt-8 space-y-6 md:flex-row md:space-y-0 space-between">
        <div className="flex-grow w-full md:w-[50%] pr-4">
          <Text.BODY3>Leverage</Text.BODY3>
          <TextWithSkeleton
            value={`${yourLeverage.toFixed(4)}`}
            loading={getLoadingState(
              !isPositionLoaded && !userLstEquity.loaded
            )}
            isAuthorityValue
          />
        </div>
        <div className="flex-grow w-full md:w-[50%]">
          <Text.BODY3>{activeLst}/SOL ratio</Text.BODY3>
          <TextWithSkeleton
            value={`${lstMetrics?.priceInSol?.toFixed(4) ?? 0}`}
            loading={!lstMetrics.loaded}
          />
        </div>
      </div>
      <div className="mt-8">
        <Text.BODY3>Est. liquidation ratio</Text.BODY3>
        <TextWithSkeleton
          value={`${
            isNaN(estLiquidationRatio) ? 0 : estLiquidationRatio.toFixed(4)
          } ${activeLst}/SOL`}
          loading={getLoadingState(
            !isAprLoaded || !isPositionLoaded || !userLstEquity.loaded
          )}
          isAuthorityValue
        />
      </div>
    </div>
  );
};

const HistoryPanel = () => {
  const depositRecords = useAppStore((s) => s.eventRecords.depositRecords);
  const swapRecords = useAppStore((s) => s.eventRecords.swapRecords);
  const isRecordsLoaded = useAppStore((s) => s.eventRecords.loaded);
  const currentUserAccount = useAppStore((s) => s.currentUserAccount);
  const [displayHistory, setDisplayHistory] = useState<
    { txDescription: string; txSig: string; txDate: string }[]
  >([]);
  const driftEnv = useCommonDriftStore((s) => s.env.driftEnv);
  const userAccountKey =
    useAppStore((s) => s.currentUserAccount.user)
      ?.getUserAccountPublicKey()
      ?.toString() ?? "";
  const spotMarkets = SpotMarkets[driftEnv] || SpotMarkets["mainnet-beta"];
  const authority = useCommonDriftStore((s) => s.authority);

  useEffect(() => {
    const newDisplayHistory = depositRecords
      //@ts-ignore
      .concat(...swapRecords)
      // if swap and deposit in same tx, show swap as being more recent
      .sort((a, b) => {
        return b.ts.toNumber() === a.ts.toNumber()
          ? //@ts-ignore
            b.amountOut
            ? 1
            : -1
          : b.ts.toNumber() - a.ts.toNumber();
      })
      .map((record) => {
        let txDescription;

        const isDepositRecord = !!record.amount;

        if (isDepositRecord) {
          const spotMarket = spotMarkets.find(
            (mkt: SpotMarketConfig) => mkt.marketIndex === record.marketIndex
          ) as SpotMarketConfig;

          txDescription = `${
            record.direction.deposit ? "Deposited" : "Withdrew"
          } ${BigNum.from(record.amount, spotMarket.precisionExp).prettyPrint(
            true
          )} ${
            spotMarket.symbol === "jitoSOL" ? "JitoSOL" : spotMarket.symbol
          }`;
        } else {
          const outMarket = spotMarkets.find(
            //@ts-ignore
            (mkt: SpotMarketConfig) => mkt.marketIndex === record.outMarketIndex
          ) as SpotMarketConfig;
          const inMarket = spotMarkets.find(
            //@ts-ignore
            (mkt: SpotMarketConfig) => mkt.marketIndex === record.inMarketIndex
          ) as SpotMarketConfig;

          txDescription = `Swapped ${BigNum.from(
            //@ts-ignore
            record.amountIn,
            inMarket.precisionExp
          ).prettyPrint(true)} ${
            inMarket.symbol === "jitoSOL" ? "JitoSOL" : inMarket.symbol
          } for ${BigNum.from(
            //@ts-ignore
            record.amountOut,
            outMarket.precisionExp
          ).prettyPrint(true)} ${
            outMarket.symbol === "jitoSOL" ? "JitoSOL" : outMarket.symbol
          }`;
        }
        return {
          txDescription,
          txSig: record.txSig,
          txDate: format(new Date(record.ts.toNumber() * 1000)),
        };
      });
    setDisplayHistory(newDisplayHistory);
  }, [depositRecords?.length, swapRecords?.length]);

  return (
    <div className="w-full pt-4 pr-2 shrink-0">
      <a
        href={`https://app.drift.trade/overview?userAccount=${userAccountKey}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center"
      >
        <Text.BODY3>Transaction History</Text.BODY3>
        <img src="/drift.svg" alt="drift" className="h-4 ml-2" />
      </a>
      <div className="mt-2 max-h-[500px] overflow-y-auto thin-scroll">
        {authority &&
        (!currentUserAccount.loaded ||
          (!isRecordsLoaded && !!currentUserAccount.user)) ? (
          <Skeleton count={8} height={21} />
        ) : displayHistory.length === 0 ? (
          <Text.BODY1>No transactions yet.</Text.BODY1>
        ) : (
          displayHistory.map((row, index) => {
            return (
              <div
                key={`tx_record_${index}`}
                className="flex items-center justify-between gap-2 py-1"
              >
                <Text.BODY1>{row.txDescription}</Text.BODY1>
                <Text.BODY1 className="text-right min-w-[93px]">
                  <a
                    href={`https://solscan.io/tx/${row.txSig}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center"
                  >
                    {row.txDate}
                    <span className="inline-flex items-center w-5 h-5 ">
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                    </span>
                  </a>
                </Text.BODY1>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const PANELS = [
  <VaultOverviewPanel key={0} />,
  <YourStakePanel key={1} />,
  <HistoryPanel key={2} />,
];

const VaultInfoPanel = () => {
  const { userLstEquity: userLstEquity } = useCurrentSuperstakePosition();
  const activeLst = useAppStore((s) => s.activeLst);

  // MAY need to move this into the app store:
  const [selectedPanel, setSelectedPanel] = useState(0);

  const hasDefaultedToUserStakePanel = useRef(false);

  const handleSwitchPanels = (direction: "left" | "right") => {
    if (direction === "left" && selectedPanel > 0) {
      setSelectedPanel(selectedPanel - 1);
    }
    if (direction === "right" && selectedPanel < PANELS.length - 1) {
      setSelectedPanel(selectedPanel + 1);
    }
  };

  useEffect(() => {
    if (userLstEquity.value > 0 && !hasDefaultedToUserStakePanel.current) {
      setSelectedPanel(1);
      hasDefaultedToUserStakePanel.current = true;
    }
  }, [userLstEquity.value]);

  return (
    <div>
      <Text.H2>{activeLst} Super Staking</Text.H2>
      <div className="mt-2 bg-accent-pink w-20 h-1.5 rounded" />

      {/* Carousel section */}
      <div className="w-full mb-20">
        <div className="relative w-full overflow-x-hidden">
          <div
            className="relative flex flex-row w-full transition-all"
            style={{
              left: `-${selectedPanel * 100}%`,
            }}
          >
            {PANELS}
          </div>
        </div>
      </div>

      {/* Bottom panel left/right controls */}
      <div className="flex flex-row items-center w-full">
        <button
          onClick={() => handleSwitchPanels("left")}
          className="flex flex-row grow"
        >
          <ChevronLeftIcon
            className={`w-10 h-10 ${
              selectedPanel === 0 ? "opacity-20 cursor-default" : ""
            }`}
          />
        </button>

        <div className="flex flex-row items-stretch justify-center space-x-2">
          {PANELS.map((_, index) => (
            <Bubble
              selected={index === selectedPanel}
              key={index}
              onClick={() => setSelectedPanel(index)}
            />
          ))}
        </div>

        <button
          onClick={() => handleSwitchPanels("right")}
          className="flex flex-row-reverse grow"
        >
          <ChevronRightIcon
            className={`w-10 h-10  ${
              selectedPanel === PANELS.length - 1
                ? "opacity-20 cursor-default"
                : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default React.memo(VaultInfoPanel);
