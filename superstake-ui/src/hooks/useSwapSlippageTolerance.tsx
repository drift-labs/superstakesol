import { useLocalStorage } from "react-use";
import { singletonHook } from "react-singleton-hook";
import { SLIPPAGE_TOLERANCE_DEFAULT } from "../constants";

const INITIAL_STATE = {
  swapSlippageTolerance: SLIPPAGE_TOLERANCE_DEFAULT,
  setSwapSlippageTolerance: () => {},
};

function useSwapSlippageTolerance() {
  const [swapSlippageTolerance, setSwapSlippageTolerance] =
    useLocalStorage<number>(
      "swapSlippageTolerance",
      SLIPPAGE_TOLERANCE_DEFAULT,
      {
        raw: false,
        serializer: JSON.stringify,
        deserializer: JSON.parse,
      }
    );

  return { swapSlippageTolerance, setSwapSlippageTolerance };
}

export default singletonHook(INITIAL_STATE, useSwapSlippageTolerance);
