import {
  Button,
  ConfirmationModal,
  Input,
  RadioInput,
  usePrevious,
} from "@canonical/react-components";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

import SyncModelCanConfigure from "components/SyncModelCanConfigure";
import { useQueryParams } from "hooks/useQueryParams";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getModelData,
  getModelList,
  getModelsByCredential,
  getSelectedModelsForDestruction,
} from "store/juju/selectors";
import { getDestroyBlockedReason, pluralize } from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import { formatBulkDestructionData } from "utils/formatBulkDestructionData";

import { Label } from "../types";

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

  const { destroyable, reviewed } = formatBulkDestructionData(selectedModels);
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
      confirmButtonDisabled
      onConfirm={handleClose}
      close={handleClose}
    >
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
              appearance={allReviewed ? "positive" : undefined}
              disabled={!canReview}
              onClick={handleReview}
            >
              {someReviewed
                ? `${reviewed.length}/${destroyable.length} Reviewed`
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
