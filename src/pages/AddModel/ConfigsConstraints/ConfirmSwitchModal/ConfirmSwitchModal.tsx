import { ConfirmationModal, usePortal } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";

import { InputMode } from "../../types";
import { FieldName, type FormFields } from "../types";

import type { ConfirmSwitchModalProps } from "./types";

const ConfirmSwitchModal = ({
  onClose,
}: ConfirmSwitchModalProps): JSX.Element => {
  const { setFieldValue } = useFormikContext<FormFields>();
  const { Portal } = usePortal();

  return (
    <Portal>
      <ConfirmationModal
        title="YAML configuration will be lost"
        cancelButtonLabel="Keep editing in YAML"
        confirmButtonLabel="Discard and switch"
        confirmButtonAppearance="primary"
        onConfirm={() => {
          void setFieldValue(FieldName.CONFIG_YAML, "");
          void setFieldValue(FieldName.CONFIG_INPUT_MODE, InputMode.LIST);
          onClose();
        }}
        close={onClose}
      >
        <p>
          Model configuration data has not been loaded. Returning to list view
          will discard the current YAML configuration. You can still create a
          model in the YAML view.
        </p>
      </ConfirmationModal>
    </Portal>
  );
};

export default ConfirmSwitchModal;
