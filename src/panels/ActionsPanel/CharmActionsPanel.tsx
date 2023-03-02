/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@canonical/react-components";
import {
  MutableRefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import reactHotToast from "react-hot-toast";
import { useSelector } from "react-redux";
import { StringParam, useQueryParam, useQueryParams } from "use-query-params";

import Aside from "components/Aside/Aside";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import PanelHeader from "components/PanelHeader/PanelHeader";
import RadioInputBox from "components/RadioInputBox/RadioInputBox";

import { EnqueuedActions } from "@canonical/jujulib/dist/api/facades/action/ActionV6";
import LoadingHandler from "components/LoadingHandler/LoadingHandler";
import ToastCard from "components/ToastCard/ToastCard";
import { generateIconImg } from "components/utils";
import useAnalytics from "hooks/useAnalytics";
import { executeActionOnUnits } from "juju/api";
import { ApplicationInfo } from "juju/types";
import ActionOptions from "panels/ActionsPanel/ActionOptions";
import {
  ActionData,
  ActionOptionValue,
  ActionOptionValues,
  enableSubmit,
} from "panels/ActionsPanel/ActionsPanel";
import { useParams } from "react-router-dom";
import {
  getModelUUIDFromList,
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { useAppStore } from "store/store";
import "../ActionsPanel/_actions-panel.scss";

export default function CharmActionsPanel(): JSX.Element {
  const sendAnalytics = useAnalytics();
  const { userName, modelName } = useParams();

  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const appState = useAppStore().getState();

  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [confirmType, setConfirmType] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>();
  const actionOptionsValues = useRef<ActionOptionValues>({});
  const [queryParams] = useQueryParams({
    charm: StringParam,
  });
  const selectedApplications = useSelector(
    getSelectedApplications(queryParams.charm || "")
  );
  const selectedCharm = useSelector(getSelectedCharm(queryParams.charm || ""));
  const actionData: ActionData = useMemo(
    () => selectedCharm?.actions?.specs || {},
    [selectedCharm]
  );
  const closePanel = useQueryParam("panel")[1];
  const generateTitle = () => {
    if (!selectedApplications || !selectedCharm)
      return "You need to select a charm and applications to continue.";
    const totalUnits = selectedApplications.reduce(
      (total, app) => total + (app["unit-count"] || 0),
      0
    );

    return (
      <h5>
        {generateIconImg(selectedCharm?.meta?.name || "", selectedCharm?.url)}{" "}
        {selectedApplications.length}{" "}
        {pluralize(selectedApplications.length, "application")} ({totalUnits}{" "}
        {pluralize(selectedApplications.length, "unit")}) selected
      </h5>
    );
  };

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
            .fill(a.name)
            .map((unit, i) => `${unit}-${i}`)
        )
        .flat(),
      selectedAction,
      actionOptionsValues.current[selectedAction],
      modelUUID,
      appState
    )
      .then((payload: EnqueuedActions) => {
        const error = payload.actions?.find((e) => e.error);
        if (error) throw error;
        reactHotToast.custom((t) => (
          <ToastCard
            toastInstance={t}
            type="positive"
            text="Action successfully executed."
          />
        ));
      })
      .catch(() => {
        reactHotToast.custom((t) => (
          <ToastCard
            toastInstance={t}
            type="negative"
            text="Some of the actions failed to execute"
          />
        ));
      });
  };

  const handleSubmit = () => {
    setConfirmType("submit");
  };

  const changeHandler = useCallback(
    (actionName: string, values: ActionOptionValue) => {
      onValuesChange(actionName, values, actionOptionsValues);
      enableSubmit(
        selectedAction,
        selectedApplications.map((a) => a.name),
        actionData,
        actionOptionsValues,
        setDisableSubmit
      );
    },
    [selectedAction]
  );

  const selectHandler = useCallback(
    (actionName: string) => {
      setSelectedAction(actionName);
      enableSubmit(
        actionName,
        selectedApplications.map((a) => a.name),
        actionData,
        actionOptionsValues,
        setDisableSubmit
      );
    },
    [actionData]
  );

  const generateConfirmationModal = () => {
    if (confirmType && selectedAction) {
      // Allow for adding more confirmation types, like for cancel
      // if inputs have been changed.
      if (confirmType === "submit") {
        return SubmitConfirmation(
          selectedAction,
          selectedApplications,
          () => {
            setConfirmType("");
            executeAction();
            closePanel("");
          },
          () => setConfirmType("")
        );
      }
    }
  };

  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={generateTitle()} />
        <div className="actions-panel__action-list">
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
        </div>
        <div className="actions-panel__drawer">
          <Button
            appearance="positive"
            className="actions-panel__run-action"
            disabled={disableSubmit}
            onClick={handleSubmit}
          >
            Run action
          </Button>
        </div>
      </div>
    </Aside>
  );
}

function onValuesChange(
  actionName: string,
  values: ActionOptionValue,
  optionValues: MutableRefObject<ActionOptionValues>
) {
  const updatedValues: ActionOptionValue = {};
  Object.keys(values).forEach((key) => {
    // Use toString to convert booleans to strings as this is what the API requires.
    updatedValues[key.replace(`${actionName}-`, "")] = values[key].toString();
  });

  optionValues.current = {
    ...optionValues.current,
    [actionName]: updatedValues,
  };
}

function SubmitConfirmation(
  actionName: string,
  applications: ApplicationInfo[],
  confirmFunction: () => void,
  cancelFunction: () => void
): JSX.Element {
  const applicationCount = applications.length;
  const unitCount = applications.reduce(
    (total, app) => total + (app["unit-count"] || 0),
    0
  );
  return (
    <ConfirmationModal
      buttonRow={
        <div>
          <Button key="cancel" onClick={cancelFunction}>
            Cancel
          </Button>
          <Button appearance="positive" key="save" onClick={confirmFunction}>
            Confirm
          </Button>
        </div>
      }
    >
      <div>
        <h4>Run {actionName}?</h4>
        <div className="p-confirmation-modal__info-group">
          <div className="p-confirmation-modal__sub-header">
            APPLICATION COUNT (UNIT COUNT)
          </div>
          <div data-testid="confirmation-modal-unit-count">
            {applicationCount} ({unitCount})
          </div>
        </div>
      </div>
    </ConfirmationModal>
  );
}
