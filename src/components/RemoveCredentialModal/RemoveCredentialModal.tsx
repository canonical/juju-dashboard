import {
  Button,
  ConfirmationModal,
  Modal,
  Notification as ReactNotification,
} from "@canonical/react-components";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { shallowEqual } from "react-redux";

import { getWSControllerURL } from "store/general/selectors";
import { getCloudTags, getRemoveCredential } from "store/juju/selectors";
import type { RemoveCredentialEntry } from "store/juju/types";
import { pluralize } from "store/juju/utils/models";
import { removeCredential } from "store/middleware/process";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import { useAppDispatch, useAppSelector } from "store/store";
import { toastNotification } from "utils/toastNotification";

import { Label } from "./types";

type Props = {
  credentialTag: string;
  credentialName: string;
  modelCount?: number;
  closePortal: () => void;
};

export default function RemoveCredentialModal({
  credentialTag,
  credentialName,
  modelCount,
  closePortal,
}: Props): JSX.Element {
  const [submitted, setSubmitted] = useState(false);
  const [previousOutcome, setPreviousOutcome] =
    useState<RemoveCredentialEntry["outcome"]>(null);
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";
  const cloudTags = useAppSelector(getCloudTags, shallowEqual);
  const { running, outcome } = useAppSelector((state) =>
    getRemoveCredential(state, credentialTag),
  );
  // Ignore an outcome left over from an earlier attempt: only react to one
  // that differs from the outcome in the store when Remove was clicked.
  const newOutcome = submitted && outcome !== previousOutcome ? outcome : null;
  const succeeded = !!newOutcome && "result" in newOutcome;

  useEffect(() => {
    if (succeeded) {
      closePortal();
      toastNotification(
        `${Label.TOAST_PREFIX} ${credentialName} ${Label.REMOVED}`,
        "positive",
      );
      dispatch(
        userCredentialsMiddleware.actions.invalidate({
          wsControllerURL,
          cloudTags,
        }),
      );
    }
  }, [
    succeeded,
    closePortal,
    credentialName,
    dispatch,
    wsControllerURL,
    cloudTags,
  ]);

  const handleConfirm = (): void => {
    setPreviousOutcome(outcome);
    setSubmitted(true);
    dispatch(removeCredential.run({ wsControllerURL, credentialTag }));
  };

  if (modelCount) {
    return (
      <Modal
        className="remove-credential-modal"
        title={
          <>
            {Label.IN_USE_TITLE} <b>{credentialName}</b>
          </>
        }
        close={closePortal}
        buttonRow={<Button onClick={closePortal}>{Label.CLOSE}</Button>}
      >
        <p>
          {modelCount} {pluralize(modelCount, "model")}{" "}
          {modelCount === 1 ? Label.IN_USE_SINGULAR : Label.IN_USE_PLURAL}{" "}
          {Label.IN_USE_DETAILS}
        </p>
      </Modal>
    );
  }

  return (
    <ConfirmationModal
      className="remove-credential-modal"
      title={
        <>
          {Label.TITLE} <b>{credentialName}</b>
        </>
      }
      confirmButtonLabel={Label.REMOVE}
      cancelButtonLabel={Label.CANCEL}
      confirmButtonLoading={running}
      onConfirm={handleConfirm}
      close={closePortal}
    >
      {newOutcome && "error" in newOutcome ? (
        <ReactNotification severity="negative">
          {newOutcome.error.message}
        </ReactNotification>
      ) : null}
      <p>
        {Label.CONFIRM_MESSAGE} {credentialName}?
      </p>
    </ConfirmationModal>
  );
}
