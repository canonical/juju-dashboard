import {
  Button,
  ConfirmationModal,
  Input,
  Notification as ReactNotification,
  RadioInput,
  usePrevious,
} from "@canonical/react-components";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { shallowEqual } from "react-redux";

import SyncModelCanConfigure from "components/SyncModelCanConfigure";
import useModelDestructionData from "hooks/useModelDestructionData";
import { useQueryParams } from "hooks/useQueryParams";
import { Label as DestroyModelsLabel } from "panels/DestroyModelsPanel/types";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCloudTags,
  getModelData,
  getModelList,
  getModelsByCredential,
  getRemoveCredential,
  getRemoveCredentialWithModels,
  getSelectedModelsForDestruction,
} from "store/juju/selectors";
import {
  DestroyBlockedReason,
  type RemoveCredentialWithModelsEntry,
} from "store/juju/types";
import { getDestroyBlockedReason, pluralize } from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import { formatBulkDestructionData } from "utils/formatBulkDestructionData";

import { Label } from "../types";

const blockedReasons: Record<DestroyBlockedReason, string> = {
  [DestroyBlockedReason.IS_CONTROLLER]:
    DestroyModelsLabel.TOOLTIP_CONTROLLER_MODEL,
  [DestroyBlockedReason.NO_ACCESS]: DestroyModelsLabel.TOOLTIP_NO_ACCESS,
  [DestroyBlockedReason.CONNECTED_OFFERS]:
    DestroyModelsLabel.TOOLTIP_CONNECTED_OFFERS,
};

type Props = {
  credentialTag: string;
  credentialName: string;
  modelCount: number;
  closePortal: () => void;
};

export default function RemoveCredentialWithModelsDialog({
  credentialTag,
  credentialName,
  modelCount,
  closePortal,
}: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const models = useAppSelector((state) =>
    getModelsByCredential(state, credentialTag),
  );
  const modelData = useAppSelector(getModelData);
  const modelList = useAppSelector(getModelList);
  const selectedModels = useAppSelector(getSelectedModelsForDestruction);
  const [panelQs, setPanelQs] = useQueryParams<{
    panel: null | string;
    credentialTag: null | string;
  }>({
    panel: null,
    credentialTag: null,
  });
  const [confirmInput, setConfirmInput] = useState("");
  const reviewOpen =
    panelQs.panel === "destroy-models" &&
    panelQs.credentialTag === credentialTag;
  const wasReviewOpen = usePrevious(reviewOpen);
  const reviewButton = useRef<HTMLElement | null>(null);
  const isOwnSelection =
    selectedModels.length === models.length &&
    models.every(({ modelUUID }) =>
      selectedModels.some((selected) => selected.modelUUID === modelUUID),
    );
  const cloudTags = useAppSelector(getCloudTags, shallowEqual);
  // Removing the credential is run by a listener, so it keeps going if this
  // dialog is closed and is shown again when it is reopened.
  const operation = useAppSelector((state) =>
    getRemoveCredentialWithModels(state, credentialTag),
  );
  const { running, outcome } = useAppSelector((state) =>
    getRemoveCredential(state, credentialTag),
  );
  const destructionDataByUUID = useModelDestructionData(
    (operation?.models ?? selectedModels).map(({ modelUUID }) => modelUUID),
  );

  useEffect(() => {
    if (wasReviewOpen && !reviewOpen) {
      reviewButton.current?.focus({ preventScroll: true });
    }
  }, [reviewOpen, wasReviewOpen]);

  const handleReview = (event: React.MouseEvent<HTMLElement>): void => {
    if (!wsControllerURL) {
      return;
    }
    reviewButton.current = event.currentTarget;
    const openReview = (): void => {
      setPanelQs({ panel: "destroy-models", credentialTag }, { replace: true });
    };
    // Re-seeding the selection would reset the models already reviewed.
    if (isOwnSelection) {
      openReview();
      return;
    }
    dispatch(
      jujuActions.selectModelsForDestruction({
        models: models.map(({ modelUUID, modelName }) => {
          const destroyBlockedReason = getDestroyBlockedReason(
            modelData[modelUUID],
            modelList[modelUUID]?.canConfigure,
          );
          return {
            modelUUID,
            modelName,
            destroyBlockedReason,
            skipped: destroyBlockedReason !== null,
          };
        }),
        wsControllerURL,
      }),
    );
    openReview();
  };

  const handleClose = (): void => {
    // Escape, × and Cancel all call this, so close the review panel first.
    if (reviewOpen) {
      setPanelQs({ panel: null, credentialTag: null }, { replace: true });
      return;
    }
    // The review panel keeps the selection for this dialog, so clear it here.
    if (isOwnSelection) {
      dispatch(jujuActions.clearSelectedModelsForDestruction());
    }
    closePortal();
  };

  const { destroyable, reviewed, skipped } =
    formatBulkDestructionData(selectedModels);
  const allReviewed =
    isOwnSelection &&
    destroyable.length > 0 &&
    reviewed.length === destroyable.length;
  const someReviewed = isOwnSelection && reviewed.length > 0;
  const modelWord = pluralize(modelCount, "model");
  const expectedConfirmString = `destroy ${modelCount} ${modelWord}`;
  const isConfirmValid = confirmInput === expectedConfirmString;
  // Seeding before every model's access is known would block it as "no access".
  const canReview =
    models.length === modelCount &&
    models.every(
      ({ modelUUID }) => modelList[modelUUID]?.canConfigure !== undefined,
    );
  const blockedModels = isOwnSelection ? skipped : [];
  const canSubmit =
    !operation &&
    isOwnSelection &&
    models.length === modelCount &&
    blockedModels.length === 0 &&
    allReviewed &&
    isConfirmValid;
  const removalFailed =
    operation?.status === "removing" &&
    !running &&
    !!outcome &&
    "error" in outcome;
  const canRetry =
    operation?.status === "failed" ||
    operation?.status === "timedOut" ||
    removalFailed;
  // The selection is cleared once the models are being destroyed.
  const showReviewed = !!operation || someReviewed;
  const reviewedCount = operation?.models.length ?? reviewed.length;
  const destroyableCount = operation?.models.length ?? destroyable.length;

  const startRemoval = (
    toDestroy: RemoveCredentialWithModelsEntry["models"],
    credentialModels: RemoveCredentialWithModelsEntry["models"],
  ): void => {
    if (!wsControllerURL) {
      return;
    }
    // Start the listener first so it sees any errors from destroying the models.
    dispatch(
      jujuActions.removeCredentialWithModelsStart({
        credentialTag,
        credentialName,
        cloudTags,
        models: credentialModels,
        wsControllerURL,
      }),
    );
    if (toDestroy.length) {
      dispatch(
        jujuActions.destroyModels({
          models: toDestroy.map(({ modelUUID, modelName }) => ({
            "model-tag": `model-${modelUUID}`,
            ...(destructionDataByUUID[modelUUID]?.hasStorage
              ? { "destroy-storage": true }
              : {}),
            modelUUID,
            modelName,
          })),
          wsControllerURL,
        }),
      );
    }
  };

  const handleRemoveWithModels = (): void => {
    if (!canSubmit) {
      return;
    }
    const destroyableModels = destroyable.map(({ modelUUID, modelName }) => ({
      modelUUID,
      modelName,
    }));
    startRemoval(destroyableModels, destroyableModels);
    dispatch(jujuActions.clearSelectedModelsForDestruction());
  };

  const handleRetry = (): void => {
    if (!operation || !canRetry) {
      return;
    }
    // After a failure the other models were accepted and are still being
    // destroyed, so only the failed ones are sent again.
    startRemoval(
      operation.models.filter(
        ({ modelUUID }) =>
          modelUUID in modelList &&
          (operation.status !== "failed" ||
            modelUUID in operation.failedModels),
      ),
      operation.models,
    );
  };
  return (
    <ConfirmationModal
      className="remove-credential-dialog prevent-panel-close"
      closeOnOutsideClick={!reviewOpen}
      title={
        <>
          {Label.TITLE} <b>{credentialName}</b>
        </>
      }
      confirmButtonLabel={Label.REMOVE_WITH_MODELS}
      cancelButtonLabel={Label.CANCEL}
      confirmButtonDisabled={!canSubmit && !canRetry}
      confirmButtonLoading={!!operation && !canRetry}
      onConfirm={operation ? handleRetry : handleRemoveWithModels}
      close={handleClose}
    >
      {operation?.status === "failed" ? (
        <ReactNotification
          severity="negative"
          title={Label.DESTROY_FAILED}
          messageElement="div"
        >
          <ul className="u-no-margin--bottom">
            {operation.models
              .filter(({ modelUUID }) => modelUUID in operation.failedModels)
              .map(({ modelUUID, modelName }) => (
                <li key={modelUUID}>
                  {modelName}: {operation.failedModels[modelUUID]}
                </li>
              ))}
          </ul>
        </ReactNotification>
      ) : null}
      {operation?.status === "timedOut" ? (
        <ReactNotification severity="negative">
          {Label.DESTROY_TIMED_OUT}
        </ReactNotification>
      ) : null}
      {removalFailed ? (
        <ReactNotification severity="negative">
          {outcome.error.message}
        </ReactNotification>
      ) : null}
      {blockedModels.length > 0 ? (
        <ReactNotification
          severity="caution"
          title={Label.MODELS_BLOCKED}
          messageElement="div"
        >
          <ul className="u-no-margin--bottom">
            {blockedModels.map(
              ({ modelUUID, modelName, destroyBlockedReason }) => (
                <li key={modelUUID}>
                  {modelName}:{" "}
                  {destroyBlockedReason
                    ? blockedReasons[destroyBlockedReason]
                    : null}
                </li>
              ),
            )}
          </ul>
        </ReactNotification>
      ) : null}
      {models.map(({ modelUUID }) => (
        <SyncModelCanConfigure key={modelUUID} modelUUID={modelUUID} />
      ))}
      <p>
        You cannot remove a credential that is being used by a model. This
        credential is used by {modelCount} {modelWord}.
      </p>
      <p>{Label.PICK_OPTION}</p>
      <div role="radiogroup" aria-label={Label.PICK_OPTION}>
        <RadioInput
          label={Label.SET_NEW_CREDENTIAL}
          name="remove-credential-option"
          value="set-new-credential"
          disabled
        />
        <RadioInput
          label={Label.DELETE_MODELS_AND_CREDENTIAL}
          name="remove-credential-option"
          value="delete-models"
          defaultChecked
        />
      </div>
      <p>
        By destroying{" "}
        <b>
          {modelCount} {modelWord}
        </b>{" "}
        you will also be destroying all applications, machines and storage
        within. Review before continuing
      </p>
      <hr className="p-rule" />
      <ol className="u-no-margin--left">
        <li>
          {Label.REVIEW_MODELS_STEP}
          <div>
            <Button
              appearance={operation || allReviewed ? "positive" : undefined}
              disabled={!canReview || !!operation}
              onClick={handleReview}
            >
              {showReviewed
                ? `${reviewedCount}/${destroyableCount} Reviewed`
                : `Review ${modelCount} ${modelWord}`}
            </Button>
          </div>
          <hr className="p-rule" />
        </li>
        <li>
          {Label.CONFIRM_REMOVAL_STEP}
          <Input
            label={`To destroy the models above, enter "${expectedConfirmString}".`}
            placeholder={expectedConfirmString}
            type="text"
            disabled={!!operation}
            value={confirmInput}
            onChange={(ev) => {
              setConfirmInput(ev.target.value);
            }}
            error={
              confirmInput.length > 0 && !isConfirmValid
                ? `Incorrect confirmation, enter "${expectedConfirmString}" to destroy`
                : undefined
            }
          />
        </li>
      </ol>
    </ConfirmationModal>
  );
}
