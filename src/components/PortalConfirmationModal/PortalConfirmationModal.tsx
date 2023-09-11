import { ConfirmationModal } from "@canonical/react-components";
import type { ConfirmationModalProps } from "@canonical/react-components/dist/components/ConfirmationModal";
import usePortal from "react-useportal";

import "./_portal-confirmation-modal.scss";

const PortalConfirmationModal = (props: ConfirmationModalProps) => {
  const { Portal } = usePortal();

  return (
    <Portal>
      <ConfirmationModal {...props}>{props.children}</ConfirmationModal>
    </Portal>
  );
};

export default PortalConfirmationModal;
