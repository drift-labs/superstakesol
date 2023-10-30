import { DEVNET_RPCS, MAINNET_RPCS } from "../constants";
import Env from "../constants/environment";
import { RpcEndpoint } from "@drift/common";
import { singletonHook } from "react-singleton-hook";
import { useLocalStorage } from "react-use";

type UserSettings = {
  rpc: RpcEndpoint;
};

const rpcToUse =
  Env.driftEnv === "mainnet-beta"
    ? MAINNET_RPCS.find((rpc) => rpc.label.toLowerCase().match("helius")) ||
      MAINNET_RPCS[0]
    : DEVNET_RPCS[0];

const defaultUserSettings = {
  rpc: rpcToUse,
};

const useSavedSettings = () => {
  const [savedSettings, setSavedSettings] = useLocalStorage<UserSettings>(
    "settings",
    defaultUserSettings
  );

  return [savedSettings, setSavedSettings] as [
    UserSettings,
    (savedSettings: UserSettings) => void
  ];
};

export default singletonHook(
  [defaultUserSettings, () => {}] as [
    UserSettings,
    (savedSettings: UserSettings) => void
  ],
  useSavedSettings
);
