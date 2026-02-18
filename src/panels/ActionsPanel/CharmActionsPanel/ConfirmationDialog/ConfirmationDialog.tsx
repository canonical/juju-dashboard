import { ConfirmationModal, usePortal } from "@canonical/react-components";
import type { JSX } from "react";
import reactHotToast from "react-hot-toast";
import { useParams } from "react-router";

import ToastCard from "components/ToastCard";
import type { ToastInstance } from "components/ToastCard";
import useAnalytics from "hooks/useAnalytics";
import { useExecuteActionOnUnits } from "juju/api-hooks";
import type { ActionOptionValue } from "panels/ActionsPanel/types";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import {
  getModelApplications,
  getModelUUIDFromList,
} from "store/juju/selectors";
import type { JujuState } from "store/juju/types";
import { getScale } from "store/juju/utils/units";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import { Label, TestId } from "./types";

type Props = {
  confirmType: ConfirmTypes;
  selectedAction: string;
  selectedApplications: JujuState["selectedApplications"];
  setConfirmType: React.Dispatch<React.SetStateAction<ConfirmTypes>>;
  selectedActionOptionValue: ActionOptionValue;
  onRemovePanelQueryParams: () => void;
};

const executeAction = (
  sendAnalytics: ReturnType<typeof useAnalytics>,
  selectedAction: string,
  selectedActionOptionValue: ActionOptionValue,
  executeActionOnUnits: ReturnType<typeof useExecuteActionOnUnits>,
  selectedApplications: JujuState["selectedApplications"],
): void => {
  sendAnalytics({
    category: "ApplicationSearch",
    action: "Run action (final step)",
  });

  executeActionOnUnits(
    // transform applications to unit list for the API
    Object.entries(selectedApplications)
      .map(([name, application]) =>
        Array(Object.keys(application.units ?? {}).length)
          .fill(name)
          .filter(Boolean)
          .map((unit, i) => `${unit}-${i}`),
      )
      .flat(),
    selectedAction,
    selectedActionOptionValue,
  )
    .then((payload) => {
      const error = payload?.actions?.find((action) => action.error);
      if (error) {
        throw error;
      }
      reactHotToast.custom((toast: ToastInstance) => (
        <ToastCard toastInstance={toast} type="positive">
          {Label.ACTION_SUCCESS}
        </ToastCard>
      ));
      return;
    })
    .catch(() => {
      reactHotToast.custom((toast: ToastInstance) => (
        <ToastCard toastInstance={toast} type="negative">
          {Label.ACTION_ERROR}
        </ToastCard>
      ));
    });
};

const ConfirmationDialog = ({
  confirmType,
  selectedAction,
  selectedApplications,
  setConfirmType,
  selectedActionOptionValue,
  onRemovePanelQueryParams,
}: Props): JSX.Element | null => {
  const { Portal } = usePortal();
  const { qualifier, modelName } = useParams();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const sendAnalytics = useAnalytics();
  const executeActionOnUnits = useExecuteActionOnUnits(qualifier, modelName);

  if (confirmType === ConfirmType.SUBMIT) {
    const unitCount = applications
      ? getScale(Object.keys(selectedApplications), applications)
      : 0;
    // Render the submit confirmation modal.
    return (
      <Portal>
        <ConfirmationModal
          title={`Run ${selectedAction}?`}
          cancelButtonLabel={Label.CANCEL_BUTTON}
          confirmButtonLabel={Label.CONFIRM_BUTTON}
          confirmButtonAppearance="positive"
          onConfirm={() => {
            setConfirmType(null);
            executeAction(
              sendAnalytics,
              selectedAction,
              selectedActionOptionValue,
              executeActionOnUnits,
              selectedApplications,
            );
            onRemovePanelQueryParams();
          }}
          close={() => {
            setConfirmType(null);
          }}
        >
          <h4 className="p-muted-heading u-no-margin--bottom">
            APPLICATION COUNT (UNIT COUNT)
          </h4>
          <p {...testId(TestId.MODEL_UNIT_COUNT)}>
            {Object.keys(selectedApplications).length} ({unitCount})
          </p>
        </ConfirmationModal>
      </Portal>
    );
  }
  return null;
};

export default ConfirmationDialog;
