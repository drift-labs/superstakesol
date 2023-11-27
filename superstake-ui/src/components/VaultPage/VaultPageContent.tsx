import React, { PropsWithChildren, useEffect } from "react";
import StakeUnstakeForm from "./StakeUnstakeForm";
import VaultInfoPanel from "./VaultInfoPanel";
import { ALL_LST } from "../../constants/lst";
import Button from "../Button";
import { twMerge } from "tailwind-merge";
import useAppStore, { DEFAULT_STORE_STATE } from "../../hooks/useAppStore";
import useFirstLstWithPosition from "../../hooks/useFirstLstWithPosition";

const VaultContentPanel = (props: PropsWithChildren) => {
  return (
    <div className="bg-container-bg w-full lg:w-[50%] rounded-lg border-2 border-container-border p-8 vault-content-panel">
      {props.children}
    </div>
  );
};

const VaultPageContent = () => {
  const setAppStore = useAppStore((s) => s.set);
  const currentActiveLst = useAppStore((s) => s.activeLst);

  const firstLstWithPosition = useFirstLstWithPosition();

  useEffect(() => {
    setActiveLst(firstLstWithPosition.symbol);
  }, [firstLstWithPosition]);

  const setActiveLst = (activeLstSymbol: string) => {
    const lstData = ALL_LST.find(lst => lst.symbol === activeLstSymbol);

    setAppStore((state) => {
      state.activeLst = activeLstSymbol;
      state.stakeUnstakeForm = {
        ...DEFAULT_STORE_STATE.stakeUnstakeForm,
        leverageToUse: lstData?.defaultLeverage ?? 2,
        unstakeLeverage: 0
      }
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 mt-2">
      {/** LST Tab */}
      <div className="flex flex-row items-center justify-center">
        {ALL_LST.map((lst, index) => {
          const isFirst = index === 0;
          const isLast = index === ALL_LST.length - 1;

          return (
            <Button
              key={lst.symbol}
              className={twMerge(
                "w-[140px] rounded-none flex items-center gap-1 justify-center",
                isFirst && "rounded rounded-r-none border-r-[1px]",
                isLast && "rounded rounded-l-none border-l-[1px]"
              )}
              outerClassName={twMerge(
                "rounded-none",
                isFirst && "rounded rounded-r-none",
                isLast && "rounded rounded-l-none"
              )}
              selected={currentActiveLst === lst.symbol}
              onClick={() => setActiveLst(lst.symbol)}
            >
              <img src={lst.logoUrl} className="w-6 h-6" />
              <span className="font-bold">{lst.symbol}</span>
            </Button>
          );
        })}
      </div>

      {/** Vault Content */}
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row mt-4 lg:items-stretch max-w-full">
        <VaultContentPanel>
          <VaultInfoPanel />
        </VaultContentPanel>
        <VaultContentPanel>
          <StakeUnstakeForm />
        </VaultContentPanel>
      </div>
    </div>
  );
};

export default React.memo(VaultPageContent);
