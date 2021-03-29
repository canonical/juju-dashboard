import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DefaultRootState, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";
import { executeActionOnUnits, getActionsForApplication } from "juju";
import { getModelUUID } from "app/selectors";
import { generateIconImg } from "app/utils/utils";
import Button from "@canonical/react-components/dist/components/Button/Button";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import Aside from "components/Aside/Aside";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import PanelHeader from "components/PanelHeader/PanelHeader";
import LoadingHandler from "components/LoadingHandler/LoadingHandler";
import RadioInputBox from "components/RadioInputBox/RadioInputBox";

import ActionOptions from "./ActionOptions";

import "./_actions-panel.scss";

export type ActionData = {
  [key: string]: ActionItem;
};

type ActionItem = {
  description: string;
  params: ActionParams;
};

type ActionParams = {
  description: string;
  properties: ActionProps;
  required?: string[];
  title: string;
  type: string;
};

type ActionProps = {
  [key: string]: ActionProp;
};

type ActionProp = {
  description: string;
  type: string;
};

export type ActionOptionsType = ActionOptionDetails[];

type ActionOptionDetails = {
  name: string;
  description: string;
  type: string;
  required: boolean;
};

type ActionOptionValues = {
  [actionName: string]: ActionOptionValue;
};

type ActionOptionValue = {
  [optionName: string]: string;
};

type SetSelectedAction = (actionName: string) => void;

export type OnValuesChange = (
  actionName: string,
  options: ActionOptionValue
) => void;

export default function ActionsPanel(): JSX.Element {
  const appStore = useStore();
  const appState = appStore.getState();
  const { appName, modelName } = useParams<EntityDetailsRoute>();
  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  // Selectors.js is not typescript yet and it complains about the return value
  // of getModelUUID. TSFixMe
  const modelUUID = useSelector(
    getModelUUIDMemo as (state: DefaultRootState) => unknown
  );
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [actionData, setActionData] = useState<ActionData>({});
  const [fetchingActionData, setFetchingActionData] = useState(false);
  const [confirmType, setConfirmType] = useState<string>("");
  const [selectedAction, setSelectedAction]: [
    string | undefined,
    SetSelectedAction
  ] = useState<string>();

  const actionOptionsValues = useRef<ActionOptionValues>({});

  useEffect(() => {
    setFetchingActionData(true);
    getActionsForApplication(appName, modelUUID, appStore.getState()).then(
      (actions) => {
        if (actions?.results?.[0]?.actions) {
          setActionData(actions.results[0].actions);
        }
        setFetchingActionData(false);
      }
    );
  }, [appName, appStore, modelUUID]);

  // See above note about selectors.js typings TSFixMe
  const namespace =
    appState.juju?.modelData?.[modelUUID as string]?.applications?.[appName]
      ?.charm;

  const generateSelectedUnitList = () => "..."; // XXX req unit list selection

  const generateTitle = () => (
    <h5>{generateIconImg(appName, namespace)} 0 units selected</h5>
  );

  const executeAction = async () => {
    // You shouldn't be able to get this far without this defined but jic.
    if (!selectedAction) return;
    await executeActionOnUnits(
      // XXX The unit list is only hard coded until the
      // unit list selection has been implemented.
      ["ceph/0"],
      selectedAction,
      actionOptionsValues.current[selectedAction],
      modelUUID,
      appStore.getState()
    );
  };

  const handleSubmit = () => {
    setConfirmType("submit");
  };

  const changeHandler = useCallback(
    (actionName, values) => {
      onValuesChange(actionName, values, actionOptionsValues);
      enableSubmit(
        selectedAction,
        actionData,
        actionOptionsValues,
        setDisableSubmit
      );
    },
    [actionData, selectedAction]
  );

  const selectHandler = useCallback(
    (actionName) => {
      setSelectedAction(actionName);
      enableSubmit(
        actionName,
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
        // XXX Temporary until we can select units.
        const unitList = ["ceph/1", "ceph/3", "ceph/5"];
        return SubmitConfirmation(
          selectedAction,
          unitList.length,
          unitList,
          executeAction,
          () => setConfirmType("")
        );
      }
    }
  };

  const data = Object.keys(actionData).length > 0 ? actionData : null;

  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={generateTitle()} />
        <div className="actions-panel__unit-list">
          Run action on {appName}: {generateSelectedUnitList()}
        </div>
        <div className="actions-panel__action-list">
          <LoadingHandler
            hasData={data ? true : false}
            loading={fetchingActionData}
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
          </LoadingHandler>
        </div>
        {generateConfirmationModal()}
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
    updatedValues[key.replace(`${actionName}-`, "")] = values[key];
  });

  optionValues.current = {
    ...optionValues.current,
    [actionName]: updatedValues,
  };
}

function enableSubmit(
  selectedAction: string | undefined,
  actionData: ActionData,
  optionsValues: MutableRefObject<ActionOptionValues>,
  setDisableSubmit: (disable: boolean) => void
) {
  if (selectedAction) {
    if (hasNoOptions(selectedAction, optionsValues.current)) {
      setDisableSubmit(false);
      return;
    }
    if (
      requiredPopulated(selectedAction, actionData, optionsValues.current) &&
      optionsValidate(selectedAction, optionsValues.current)
    ) {
      setDisableSubmit(false);
      return;
    }
  }
  setDisableSubmit(true);
}

type ValidationFnProps = (
  selectedAction: string,
  optionValues: ActionOptionValues
) => boolean;

type RequiredPopulated = (
  selectedAction: string,
  actionData: ActionData,
  optionValues: ActionOptionValues
) => boolean;

const hasNoOptions: ValidationFnProps = (selected, optionValues) => {
  // If there are no options stored then it doesn't have any.
  if (!optionValues[selected]) {
    return true;
  }
  return Object.keys(optionValues[selected]).length === 0;
};

const requiredPopulated: RequiredPopulated = (
  selected,
  actionData,
  optionsValues
) => {
  const required = actionData[selected].params.required;
  if (!required) {
    return true;
  }
  if (required.length === 0) {
    return true;
  }
  return !required.some((option) => optionsValues[selected][option] === "");
};

const optionsValidate: ValidationFnProps = (selected, optionsValues) => {
  // XXX TODO
  return true;
};

function SubmitConfirmation(
  actionName: string,
  unitCount: number,
  unitList: string[],
  confirmFunction: () => void,
  cancelFunction: () => void
): JSX.Element {
  const unitNames = unitList.reduce((acc, unitName) => {
    return `${acc}, ${unitName.split("/")[1]}`;
  });
  return (
    <ConfirmationModal
      buttonRow={
        <div>
          <button
            className="p-button--neutral"
            key="cancel"
            onClick={cancelFunction}
          >
            Cancel
          </button>
          <button
            className="p-button--positive"
            key="save"
            onClick={confirmFunction}
          >
            Confirm
          </button>
        </div>
      }
    >
      <div className="actions-panel__confirmation-modal">
        <h4>Run {actionName}?</h4>
        <div className="actions-panel__confirmation-modal-info-group">
          <div className="actions-panel__confirmation-modal-sub-header">
            UNIT COUNT
          </div>
          <div>{unitCount}</div>
        </div>
        <div className="actions-panel__confirmation-modal-info-group">
          <div className="actions-panel__confirmation-modal-sub-header">
            UNIT NAME
          </div>
          <div>{unitNames}</div>
        </div>
      </div>
    </ConfirmationModal>
  );
}
