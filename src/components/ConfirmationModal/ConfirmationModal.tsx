import { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";

import { Modal } from "@canonical/react-components/dist/components/Modal/Modal";

import "./_confirmation-modal.scss";

type Props = {
  body: ReactElement;
  buttonRow: ReactNode;
};

export default function ConfirmationModal({
  body,
  buttonRow,
}: Props): ReactElement {
  const portalHost =
    document.querySelector("#confirmation-modal-container") || document.body;

  return createPortal(
    <Modal buttonRow={buttonRow}>
      <div className="confirmation-modal">{body}</div>
    </Modal>,
    portalHost
  );
}
