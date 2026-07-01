import { ConfirmationModal, usePortal } from "@canonical/react-components";
import type { JSX } from "react";

import {
  ENTITY_LABELS,
  type YAMLErrorsModalProps,
  type YAMLValidationError,
} from "./types";

const ErrorList = ({
  label,
  errors,
}: {
  label: string;
  errors: YAMLValidationError[];
}): JSX.Element | null => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <ul className="u-no-padding--left u-no-margin--left">
      {label}:
      {errors.map(({ line, message }, index) => {
        return (
          <li className="u-sh3" key={`${label}-${index}`}>
            {line ? `Line ${line}: ${message}` : message}
          </li>
        );
      })}
    </ul>
  );
};

const YAMLErrorsModal = ({
  errors,
  yamlKey,
  onConfirm,
  onClose,
}: YAMLErrorsModalProps): JSX.Element => {
  const { Portal } = usePortal();

  return (
    <Portal>
      <ConfirmationModal
        title="Invalid values will be lost"
        className="configs__error-modal"
        cancelButtonLabel="Cancel"
        confirmButtonLabel="Switch to list view"
        confirmButtonAppearance="primary"
        onConfirm={onConfirm}
        close={onClose}
      >
        <p>
          You have one or more invalid {ENTITY_LABELS[yamlKey]} values.{" "}
          <b>If you switch to list view, those values will be lost.</b>
        </p>
        <ErrorList label="Invalid keys" errors={errors.invalidKeys} />
        <ErrorList label="Invalid values" errors={errors.invalidValues} />
        <ErrorList label="Other errors" errors={errors.otherErrors} />
      </ConfirmationModal>
    </Portal>
  );
};

export default YAMLErrorsModal;
