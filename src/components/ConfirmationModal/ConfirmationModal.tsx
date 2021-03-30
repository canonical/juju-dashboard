import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Modal } from "@canonical/react-components/dist/components/Modal/Modal";

import "./_confirmation-modal.scss";

type Props = {
  children?: ReactNode;
  buttonRow: ReactNode;
};

export default function ConfirmationModal({
  children,
  buttonRow,
}: Props): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const portalHost =
    document.querySelector("#confirmation-modal-container") || document.body;

  useEffect(() => {
    if (modalRef.current) {
      const neutralButton: HTMLButtonElement | null = modalRef?.current?.querySelector(
        "button.p-button--neutral"
      );
      // If the modal has a neutral button then focus on that after opening
      // to make a better keyboard navigation experience.
      if (neutralButton) {
        neutralButton.focus();
      } else {
        // If there is no button then focus on the modal wrapper.
        modalRef.current.focus();
      }
    }
  }, []);

  return createPortal(
    <div className="p-confirmation-modal" ref={modalRef}>
      <Modal buttonRow={buttonRow}>
        <div>{children}</div>
      </Modal>
    </div>,
    portalHost
  );
}
