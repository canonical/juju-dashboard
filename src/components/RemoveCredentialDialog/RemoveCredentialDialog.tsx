import {
  Button,
  ConfirmationModal,
  Modal,
  Notification as ReactNotification,
} from "@canonical/react-components";
import type { JSX } from "react";
import { useEffect } from "react";
import { shallowEqual } from "react-redux";

import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getCloudTags, getRemoveCredential } from "store/juju/selectors";
import { removeCredential } from "store/middleware/process";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import { useAppDispatch, useAppSelector } from "store/store";
import { FeatureFlags } from "types";
import isFeatureFlagEnabled from "utils/isFeatureFlagEnabled";
import { toastNotification } from "utils/toastNotification";

import RemoveCredentialWithModelsDialog from "./RemoveCredentialWithModelsDialog";
import { Label } from "./types";

type Props = {
  credentialTag: string;
  credentialName: string;
  modelCount?: number;
  closePortal: () => void;
};

export default function RemoveCredentialDialog({
  credentialTag,
  credentialName,
  modelCount,
  closePortal,
}: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const cloudTags = useAppSelector(getCloudTags, shallowEqual);
  const { running, outcome } = useAppSelector((state) =>
    getRemoveCredential(state, credentialTag),
  );
  const succeeded = !!outcome && "result" in outcome;
  const withModels =
    !!modelCount &&
    isFeatureFlagEnabled(FeatureFlags.REMOVE_CREDENTIAL_WITH_MODELS);

  useEffect(() => {
    if (succeeded) {
      closePortal();
      if (withModels) {
        // The listener that removed the credential shows the toast and refresh.
        return;
      }
      toastNotification(`Credential ${credentialName} removed`, "positive");
      if (wsControllerURL) {
        dispatch(
          userCredentialsMiddleware.actions.invalidate({
            wsControllerURL,
            cloudTags,
          }),
        );
      }
    }
  }, [
    succeeded,
    withModels,
    closePortal,
    credentialName,
    dispatch,
    wsControllerURL,
    cloudTags,
  ]);

  const handleConfirm = (): void => {
    if (!wsControllerURL) {
      return;
    }
    dispatch(
      jujuActions.clearRemoveCredential({ credentialTag, wsControllerURL }),
    );
    dispatch(removeCredential.run({ wsControllerURL, credentialTag }));
  };

  if (withModels && modelCount) {
    return (
      <RemoveCredentialWithModelsDialog
        credentialTag={credentialTag}
        credentialName={credentialName}
        modelCount={modelCount}
        closePortal={closePortal}
      />
    );
  }

  if (modelCount) {
    return (
      <Modal
        className="remove-credential-dialog"
        title={
          <>
            {Label.IN_USE_TITLE} <b>{credentialName}</b>
          </>
        }
        close={closePortal}
        buttonRow={<Button onClick={closePortal}>{Label.CLOSE}</Button>}
      >
        <p>
          {modelCount === 1
            ? "1 model currently uses this credential. Delete that model before removing it."
            : `${modelCount} models currently use this credential. Delete those models before removing it.`}
        </p>
      </Modal>
    );
  }

  return (
    <ConfirmationModal
      className="remove-credential-dialog"
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
      {outcome && "error" in outcome ? (
        <ReactNotification severity="negative">
          {outcome.error.message}
        </ReactNotification>
      ) : null}
      <p>Are you sure you want to remove {credentialName}?</p>
    </ConfirmationModal>
  );
}
