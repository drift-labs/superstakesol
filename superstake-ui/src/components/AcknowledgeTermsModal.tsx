import useAppStore from "../hooks/useAppStore";
import { Modal, ModalTitle } from "./Modal";
import Text from "./Text";
import Checkbox from "./Checkbox";
import { useState } from "react";
import Button from "./Button";
import useLastAcknowledgedTerms from "../hooks/useLastAcknowledgedTerms";
import { useWallet } from "@drift-labs/react";

const FAQ_LINK =
  "https://superstakesol.notion.site/superstakesol/super-stake-sol-FAQ-0cab21138d1d46958fe91c7768b6fc88";

const AcknowledgeTermsModal = () => {
  const setAppStore = useAppStore((s) => s.set);
  const wallet = useWallet();
  const { updateLastAcknowledgedTerms } = useLastAcknowledgedTerms();

  const [hasCheckedTerms, setHasCheckedTerms] = useState(false);

  const handleClose = () => {
    wallet?.disconnect();
    setAppStore((s) => {
      s.modals.showAcknowledgeTermsModal = false;
    });
  };

  const handleAgree = () => {
    updateLastAcknowledgedTerms();
    setAppStore((s) => {
      s.modals.showAcknowledgeTermsModal = false;
    });
    if (wallet?.wallet?.adapter.name) {
      wallet?.connect();
    } else {
      setAppStore((s) => {
        s.modals.showConnectWalletModal = true;
      });
    }
  };

  const handleOpenShortFormTerms = () => {
    setAppStore((s) => {
      s.modals.showAcknowledgeTermsModal = false;
      s.modals.showTermsAndConditionModal = {
        isFromAcknowledgeModal: true,
        show: true,
      };
    });
  };

  return (
    <Modal onClose={handleClose}>
      <div className="flex flex-col max-w-[480px] m-auto">
        <ModalTitle title="Acknowledge Terms" />

        <div
          className="flex gap-2 px-6 cursor-pointer"
          onClick={() => setHasCheckedTerms(!hasCheckedTerms)}
        >
          <div>
            <Checkbox
              className="relative top-[2px]"
              checked={hasCheckedTerms}
              onChange={() => setHasCheckedTerms(!hasCheckedTerms)}
            />
          </div>
          <Text.BODY1>
            By continuing, you agree to the{" "}
            <span className="underline" onClick={handleOpenShortFormTerms}>
              Terms of Use
            </span>{" "}
            and have read and understood the{" "}
            <a
              className="underline"
              href={FAQ_LINK}
              target="_blank"
              rel="noreferrer"
            >
              super stake sol FAQs.
            </a>
          </Text.BODY1>
        </div>

        <div className="px-6 mt-8">
          <Button
            className="w-full"
            disabled={!hasCheckedTerms}
            onClick={handleAgree}
          >
            <Text.H5>Agree</Text.H5>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AcknowledgeTermsModal;
