import { ReactElement } from "react";
import { createPortal } from "react-dom";

import { Modal } from "@canonical/react-components/dist/components/Modal/Modal";

import "./_confirmation-modal.scss";

type Props = {
  body: ReactElement;
  buttons: ReactElement[];
};

export default function ConfirmationModal({
  body,
  buttons,
}: Props): ReactElement {
  const portalHost =
    document.querySelector("#confirmation-modal-container") || document.body;

  return createPortal(
    <Modal buttonRow={buttons}>
      <div className="confirmation-modal">{body}</div>
    </Modal>,
    portalHost
  );
}
