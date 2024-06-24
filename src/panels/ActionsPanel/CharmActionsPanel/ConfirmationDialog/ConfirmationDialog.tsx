import { ConfirmationModal } from "@canonical/react-components";
import reactHotToast from "react-hot-toast";
import { useParams } from "react-router-dom";
import usePortal from "react-useportal";

import ToastCard from "components/ToastCard";
import useAnalytics from "hooks/useAnalytics";
import { useExecuteActionOnUnits } from "juju/api-hooks";
import type { ApplicationInfo } from "juju/types";
import type { ActionOptionValue } from "panels/ActionsPanel/types";
import { ConfirmType, type ConfirmTypes } from "panels/types";

import { Label } from "./types";

type Props = {
  confirmType: ConfirmTypes;
  selectedAction: string | undefined;
  selectedApplications: ApplicationInfo[];
  setConfirmType: React.Dispatch<React.SetStateAction<ConfirmTypes>>;
  selectedActionOptionValue: ActionOptionValue | undefined;
  onRemovePanelQueryParams: () => void;
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
  const { userName, modelName } = useParams();
  const sendAnalytics = useAnalytics();
  const executeActionOnUnits = useExecuteActionOnUnits(userName, modelName);

  const executeAction = () => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Run action (final step)",
    });

    if (!selectedAction || !selectedActionOptionValue) {
      return;
    }
    executeActionOnUnits(
      // transform applications to unit list for the API
      selectedApplications
        .map((a) =>
          Array(a["unit-count"])
            .fill("name" in a ? a.name : null)
            .filter(Boolean)
            .map((unit, i) => `${unit}-${i}`),
        )
        .flat(),
      selectedAction,
      selectedActionOptionValue,
    )
      .then((payload) => {
        const error = payload?.actions?.find((e) => e.error);
        if (error) {
          throw error;
        }
        reactHotToast.custom((t) => (
          <ToastCard toastInstance={t} type="positive">
            {Label.ACTION_SUCCESS}
          </ToastCard>
        ));
        return;
      })
      .catch(() => {
        reactHotToast.custom((t) => (
          <ToastCard toastInstance={t} type="negative">
            {Label.ACTION_ERROR}
          </ToastCard>
        ));
      });
  };

  if (selectedAction && confirmType === ConfirmType.SUBMIT) {
    // Allow for adding more confirmation types, like for cancel
    // if inputs have been changed.
    const unitCount = selectedApplications.reduce(
      (total, app) => total + (app["unit-count"] || 0),
      0,
    );
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
            executeAction();
            onRemovePanelQueryParams();
          }}
          close={() => setConfirmType(null)}
        >
          <h4 className="p-muted-heading u-no-margin--bottom">
            APPLICATION COUNT (UNIT COUNT)
          </h4>
          <p data-testid="confirmation-modal-unit-count">
            {selectedApplications.length} ({unitCount})
          </p>
        </ConfirmationModal>
      </Portal>
    );
  }
  return null;
};

export default ConfirmationDialog;
