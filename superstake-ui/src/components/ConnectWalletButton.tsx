"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button, { ButtonProps } from "./Button";
import Text from "./Text";
import useAppStore from "../hooks/useAppStore";
import { useWalletConnectCheck } from "../hooks/useWalletAutoConnect";
import Chevron from "./Chevron";
import { useCommonDriftStore } from "@drift-labs/react";
import { useWallet } from "@drift-labs/react";

const ConnectWalletButton = (props: ButtonProps) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const wallet = useWallet();

  const appAuthority = useCommonDriftStore((s) => s.authority);
  const emulationMode = useCommonDriftStore((s) => s.emulationMode);
  const setAppStore = useAppStore((s) => s.set);
  const { canWalletConnect, followUpAction } = useWalletConnectCheck();

  const fullPublicKey = appAuthority?.toString() ?? "";

  const shortPublicKey = `${fullPublicKey.slice(0, 4)}...${fullPublicKey.slice(
    40,
    44
  )}`;

  const handleDisconnect = () => {
    setShowDropdown(false);
    wallet?.disconnect();
  };

  const handleClick = () => {
    if (!canWalletConnect) {
      followUpAction();
      return;
    }

    setAppStore((s) => {
      s.modals.showConnectWalletModal = true;
    });
  };

  // handle background click if dropdowno expanded
  const handleClickBackground = useCallback((event: MouseEvent) => {
    let clickedInsideDropdown = false;
    let target: HTMLElement | null = event.target as HTMLElement;
    while (target) {
      if (
        target.parentNode === dropdownRef.current ||
        target === dropdownRef.current
      ) {
        clickedInsideDropdown = true;
        break;
      }
      target = target.parentNode as HTMLElement;
    }

    let clickedInsideButton = false;
    let target2: HTMLElement | null = event.target as HTMLElement;
    while (target2) {
      if (
        target2.parentNode === buttonRef.current ||
        target2 === buttonRef.current
      ) {
        clickedInsideButton = true;
        break;
      }
      target2 = target2.parentNode as HTMLElement;
    }

    if (!clickedInsideDropdown && !clickedInsideButton) {
      setShowDropdown(false);
    }
  }, []);

  const handleClickConnected = useCallback(() => {
    if (showDropdown) {
      setShowDropdown(false);
      document.body.removeEventListener("click", handleClickBackground);
    } else {
      setShowDropdown(true);
      document.body.addEventListener("click", handleClickBackground);
    }
  }, [showDropdown]);

  useEffect(() => {
    return () => {
      document.body.removeEventListener("click", handleClickBackground);
    };
  }, []);

  if (wallet?.connected || (appAuthority && emulationMode)) {
    return (
      <div className="relative w-full">
        {showDropdown && (
          <div
            className="absolute top-0 w-full p-5 pt-20 border-2 rounded cursor-pointer bg-container-bg border-container-border"
            ref={dropdownRef}
            onClick={handleDisconnect}
          >
            <Text.H6>Disconnect</Text.H6>
          </div>
        )}
        <div className="w-full" ref={buttonRef}>
          <Button
            {...props}
            onClick={handleClickConnected}
            className={`w-full px-5 ${showDropdown ? "rounded-b-none" : ""}`}
            selected={showDropdown}
          >
            <div className="flex flex-row items-center justify-center space-x-6">
              <Text.H6 className="hidden md:block">{shortPublicKey}</Text.H6>
              <Text.H4 className="font-semibold md:hidden">
                {shortPublicKey}
              </Text.H4>
              <Chevron open={showDropdown} />
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button {...props} onClick={handleClick} className="w-full">
      <Text.H6 className="hidden md:block">Connect Wallet</Text.H6>
      <Text.H4 className="font-semibold md:hidden">Connect Wallet</Text.H4>
    </Button>
  );
};

export default React.memo(ConnectWalletButton);
