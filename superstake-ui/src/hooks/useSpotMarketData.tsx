"use client";

import { useEffect, useRef } from "react";
import useCustomDriftClientIsReady from "./useCustomDriftClientIsReady";
import useAppStore, { SpotMarketData } from "./useAppStore";
import {
  BN,
  BigNum,
  DriftClient,
  SpotBalanceType,
  SpotMarketAccount,
  getTokenAmount,
  calculateSpotMarketBorrowCapacity,
  SPOT_MARKET_RATE_PRECISION,
  getUserWithName,
  ZERO,
  calculateWithdrawLimit,
  isVariant,
  UserAccount,
} from "@drift-labs/sdk";
import { useInterval } from "react-use";
import { SOL_SPOT_MARKET_INDEX } from "../utils/uiUtils";
import { useCommonDriftStore } from "@drift-labs/react";
import { LST, ALL_LST } from "../constants/lst";

const useSpotMarketData = () => {
  const driftClientIsReady = useCustomDriftClientIsReady();
  const driftClient = useCommonDriftStore(
    (s) => s.driftClient.client
  ) as DriftClient;
  const set = useAppStore((s) => s.set);
  const fetchedTotalStakes = useRef(false);

  const setSpotMarketData = (
    newSpotMarketData: Omit<SpotMarketData, "tvl" | "tvlLoaded">
  ) => {
    set((s) => {
      s.spotMarketData = {
        ...s.spotMarketData,
        ...newSpotMarketData,
        loaded: true,
      };
    });
  };

  const setTotalLstStaked = (lstSymbol: string, totalLstStaked: BigNum) => {
    set((s) => {
      s.spotMarketData = {
        ...s.spotMarketData,
        tvl: {
          ...s.spotMarketData.tvl,
          [lstSymbol]: totalLstStaked,
        },
        tvlLoaded: true,
      };
    });
  };

  const getTotalLstStaked = async (lst: LST) => {
    const stakingUsers = await driftClient.program.account.user.all([
      getUserWithName(lst.driftAccountName),
    ]);

    let totalScaledBalance = ZERO;
    for (const stakingUser of stakingUsers) {
      const userAccount = stakingUser.account as UserAccount;
      const spotPosition = userAccount.spotPositions[1];
      if (spotPosition.marketIndex !== lst.spotMarket.marketIndex) {
        continue;
      }

      if (!isVariant(spotPosition.balanceType, "deposit")) {
        continue;
      }

      totalScaledBalance = totalScaledBalance.add(
        userAccount.spotPositions[1].scaledBalance
      );
    }

    const lstSpotMarketAccount = driftClient?.getSpotMarketAccount(
      lst.spotMarket.marketIndex
    ) as SpotMarketAccount;
    const totalLstStaked = BigNum.from(
      getTokenAmount(
        totalScaledBalance,
        lstSpotMarketAccount,
        SpotBalanceType.DEPOSIT
      ),
      lstSpotMarketAccount.decimals
    );

    setTotalLstStaked(lst.symbol, totalLstStaked);
  };

  const getAllTotalLstStaked = async () => {
    if (fetchedTotalStakes.current) {
      return;
    }

    await Promise.all(
      ALL_LST.map((lst) => {
        getTotalLstStaked(lst);
      })
    );

    fetchedTotalStakes.current = true;
  };

  const updateSpotMarketData = () => {
    const solMarketAccount = driftClient?.getSpotMarketAccount(
      SOL_SPOT_MARKET_INDEX
    ) as SpotMarketAccount;

    // make break even rate 5.5%
    const breakEvenRate = new BN(
      process.env.NEXT_PUBLIC_BETA_INCREASE_CAPACITY === "true" ? 60 : 55 // increase capacity in beta only
    )
      .mul(SPOT_MARKET_RATE_PRECISION)
      .div(new BN(1000));
    const {
      totalCapacity: totalSolBorrowCapacityBN,
      remainingCapacity: remainingSolBorrowCapactyBM,
    } = calculateSpotMarketBorrowCapacity(solMarketAccount, breakEvenRate);

    let totalSolBorrowCapacity = BigNum.from(
      totalSolBorrowCapacityBN,
      solMarketAccount.decimals
    );
    let remainingSolBorrowCapacty = BigNum.from(
      remainingSolBorrowCapactyBM,
      solMarketAccount.decimals
    );

    const { borrowLimit, maxBorrowAmount } = calculateWithdrawLimit(
      solMarketAccount,
      new BN(new Date().getTime() / 1000)
    );

    if (borrowLimit.lt(remainingSolBorrowCapacty.val)) {
      remainingSolBorrowCapacty = BigNum.from(
        BN.max(borrowLimit, ZERO),
        solMarketAccount.decimals
      );
      totalSolBorrowCapacity = BigNum.from(
        maxBorrowAmount,
        solMarketAccount.decimals
      );
    }

    const solBorrowPctUsed = totalSolBorrowCapacity
      .sub(remainingSolBorrowCapacty)
      .mul(BigNum.from(100))
      .div(totalSolBorrowCapacity)
      .toNum();

    setSpotMarketData({
      solBorrowCapacityRemaining: remainingSolBorrowCapacty,
      percentOfCapUsed: solBorrowPctUsed,
      loaded: true,
    });
  };

  useEffect(() => {
    if (driftClientIsReady) {
      updateSpotMarketData();
      getAllTotalLstStaked();
    }
  }, [driftClientIsReady]);

  useInterval(() => {
    if (driftClientIsReady) {
      updateSpotMarketData();
      getAllTotalLstStaked();
    }
  }, 10000);

  return;
};

export default useSpotMarketData;
