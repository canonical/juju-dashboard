/* eslint-disable react-hooks/exhaustive-deps */
import { Button, ConfirmationModal } from "@canonical/react-components";
import { useCallback, useMemo, useRef, useState } from "react";
import reactHotToast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import usePortal from "react-useportal";

import LoadingHandler from "components/LoadingHandler/LoadingHandler";
import Panel from "components/Panel";
import RadioInputBox from "components/RadioInputBox/RadioInputBox";
import ToastCard from "components/ToastCard/ToastCard";
import useAnalytics from "hooks/useAnalytics";
import { useExecuteActionOnUnits } from "juju/api-hooks";
import ActionOptions from "panels/ActionsPanel/ActionOptions";
import type {
  ActionOptionValue,
  ActionOptionValues,
} from "panels/ActionsPanel/ActionsPanel";
import { enableSubmit, onValuesChange } from "panels/ActionsPanel/ActionsPanel";
import CharmActionsPanelTitle from "panels/CharmsAndActionsPanel/CharmActionsPanelTitle";
import { TestId } from "panels/CharmsAndActionsPanel/CharmsAndActionsPanel";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import {
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";

export enum Label {
  NONE_SELECTED = "You need to select a charm and applications to continue.",
  ACTION_ERROR = "Some of the actions failed to execute",
  ACTION_SUCCESS = "Action successfully executed.",
  CANCEL_BUTTON = "Cancel",
  CONFIRM_BUTTON = "Confirm",
}

const filterExist = <I,>(item: I | null): item is I => !!item;

export type Props = {
  charmURL: string;
  onRemovePanelQueryParams: () => void;
};

export default function CharmActionsPanel({
  charmURL,
  onRemovePanelQueryParams,
}: Props): JSX.Element {
  const sendAnalytics = useAnalytics();
  const { userName, modelName } = useParams();
  const { Portal } = usePortal();
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);
  const [selectedAction, setSelectedAction] = useState<string>();
  const actionOptionsValues = useRef<ActionOptionValues>({});

  const selectedApplications = useSelector(getSelectedApplications(charmURL));
  const selectedCharm = useSelector(getSelectedCharm(charmURL));
  const executeActionOnUnits = useExecuteActionOnUnits(userName, modelName);
  const actionData = useMemo(
    () => selectedCharm?.actions?.specs || {},
    [selectedCharm],
  );
  const unitCount = selectedApplications.reduce(
    (total, app) => total + (app["unit-count"] || 0),
    0,
  );

  const executeAction = () => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Run action (final step)",
    });

    if (!selectedAction) return;
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
      actionOptionsValues.current[selectedAction],
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

  const handleSubmit = () => {
    setConfirmType(ConfirmType.SUBMIT);
  };

  const changeHandler = useCallback(
    (actionName: string, values: ActionOptionValue) => {
      onValuesChange(actionName, values, actionOptionsValues);
      enableSubmit(
        selectedAction,
        selectedApplications
          .map((a) => ("name" in a ? a.name : null))
          .filter(filterExist),
        actionData,
        actionOptionsValues,
        setDisableSubmit,
      );
    },
    [selectedAction],
  );

  const selectHandler = useCallback(
    (actionName: string) => {
      setSelectedAction(actionName);
      enableSubmit(
        actionName,
        selectedApplications
          .map((a) => ("name" in a ? a.name : null))
          .filter(filterExist),
        actionData,
        actionOptionsValues,
        setDisableSubmit,
      );
    },
    [actionData],
  );

  const generateConfirmationModal = () => {
    if (confirmType && selectedAction) {
      // Allow for adding more confirmation types, like for cancel
      // if inputs have been changed.
      if (confirmType === "submit") {
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
              onConfirm={(event) => {
                event.stopPropagation();
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
    }
  };

  return (
    <Panel
      drawer={
        <Button
          appearance="positive"
          disabled={disableSubmit || unitCount === 0}
          onClick={handleSubmit}
        >
          Run action
        </Button>
      }
      width="narrow"
      data-testid={TestId.PANEL}
      title={<CharmActionsPanelTitle charmURL={charmURL} />}
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      animateMount={false}
    >
      <LoadingHandler
        hasData={Object.keys(actionData).length > 0}
        loading={false}
        noDataMessage="This charm has not provided any actions."
      >
        {Object.keys(actionData).map((actionName) => (
          <RadioInputBox
            name={actionName}
            description={actionData[actionName].description}
            onSelect={selectHandler}
            selectedInput={selectedAction}
            key={actionName}
          >
            <ActionOptions
              name={actionName}
              data={actionData}
              onValuesChange={changeHandler}
            />
          </RadioInputBox>
        ))}
        {generateConfirmationModal()}
      </LoadingHandler>
    </Panel>
  );
}
