import useAppStore from "../hooks/useAppStore";
import { Modal, ModalTitle } from "./Modal";
import { MAINNET_RPCS, DEVNET_RPCS } from "../constants";
import Env from "../constants/environment";
import Button from "./Button";
import { useEffect, useState } from "react";
import { useAllRpcLatencies } from "../hooks/useRpcLatencies";
import { twMerge } from "tailwind-merge";
import { getRpcLatencyColor } from "../utils/uiUtils";
import Text from "./Text";
import { toast } from "react-toastify";
import { getResponseTime } from "@drift/common";
import { useCurrentRpc } from "@drift-labs/react";

const CUSTOM_LABEL = "Custom";

const RpcSwitcherModal = () => {
  const [currentRpc, setCurrentRpc] = useCurrentRpc();
  const setStore = useAppStore((s) => s.set);
  const allRpcLatencies = useAllRpcLatencies();

  const [selectedRpcLabel, setSelectedRpcLabel] = useState<string>("");
  const [customRpcValue, setCustomRpcValue] = useState("");

  const rpcOptions =
    Env.driftEnv === "mainnet-beta" ? MAINNET_RPCS : DEVNET_RPCS;

  useEffect(() => {
    currentRpc && setSelectedRpcLabel(currentRpc.label);
    currentRpc?.label === CUSTOM_LABEL && setCustomRpcValue(currentRpc.value);
  }, [currentRpc]);

  const onClose = () => {
    setStore((s) => {
      s.modals.showRpcSwitcherModal = false;
    });
  };

  const handleSave = async () => {
    if (
      !selectedRpcLabel ||
      (selectedRpcLabel === CUSTOM_LABEL && !customRpcValue)
    ) {
      toast.error("Please select a valid RPC");
      return;
    }

    let rpcToUse = rpcOptions.find((rpc) => rpc.label === selectedRpcLabel);
    rpcToUse = rpcToUse
      ? rpcToUse
      : {
          label: CUSTOM_LABEL,
          value: customRpcValue,
          allowAdditionalConnection: false,
        };

    const responseTime = await getResponseTime(rpcToUse.value);

    if (responseTime < 1) {
      toast.error(
        "The RPC you have selected is currently unavailable. Please try another RPC."
      );
      return;
    }

    setCurrentRpc(rpcToUse);
    onClose();
    toast.success("Successfully changed RPC");
  };

  const renderRpcOptions = () => {
    return rpcOptions.map((rpc) => {
      return (
        <div
          key={rpc.value}
          className="flex items-center justify-between w-full gap-4"
        >
          <Button
            className="w-full"
            selected={selectedRpcLabel === rpc.label}
            onClick={() => setSelectedRpcLabel(rpc.label)}
          >
            {rpc.label}
          </Button>
          <div className="min-w-[80px] text-right flex gap-2 items-center justify-end">
            <span>{allRpcLatencies[rpc.value]?.avg ?? 0}ms</span>
            <div
              className={twMerge(
                "w-3 h-3 rounded min-w-[12px]",
                `bg-[${getRpcLatencyColor(allRpcLatencies[rpc.value]?.avg)}]`
              )}
            />
          </div>
        </div>
      );
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col max-w-[480px] m-auto h-full">
        <ModalTitle title="Switch RPC" />
        <div className="flex flex-col gap-4 px-2">
          <div className="flex flex-col gap-2">
            {renderRpcOptions()}
            <div className="flex items-center justify-between w-full gap-4">
              <Button
                className="w-full"
                selected={selectedRpcLabel === CUSTOM_LABEL}
                onClick={() => setSelectedRpcLabel(CUSTOM_LABEL)}
              >
                {CUSTOM_LABEL}
              </Button>
            </div>
            <div className="h-[44px]">
              {
                <input
                  className={twMerge(
                    "w-full p-2 border-2 border-black rounded-sm transition-opacity duration-300 ease-in-out",
                    selectedRpcLabel === CUSTOM_LABEL
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                  value={customRpcValue}
                  onChange={(e) => setCustomRpcValue(e.target.value)}
                  placeholder="Enter custom RPC URL"
                />
              }
            </div>
          </div>
          <div>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={selectedRpcLabel === CUSTOM_LABEL && !customRpcValue}
            >
              <Text.H6 className="font-bold">Save</Text.H6>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RpcSwitcherModal;
