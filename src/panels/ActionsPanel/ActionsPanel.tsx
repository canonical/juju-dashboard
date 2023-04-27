import { Button } from "@canonical/react-components";
import type { MutableRefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Aside from "components/Aside/Aside";
import CharmIcon from "components/CharmIcon/CharmIcon";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import LoadingHandler from "components/LoadingHandler/LoadingHandler";
import PanelHeader from "components/PanelHeader/PanelHeader";
import RadioInputBox from "components/RadioInputBox/RadioInputBox";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import { executeActionOnUnits, getActionsForApplication } from "juju/api";
import { getModelUUID } from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import type { RootState } from "store/store";
import { useAppStore } from "store/store";

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

export type ActionOptionValues = {
  [actionName: string]: ActionOptionValue;
};

export type ActionOptionValue = {
  [optionName: string]: string;
};

type SetSelectedAction = (actionName: string) => void;

export type OnValuesChange = (
  actionName: string,
  options: ActionOptionValue
) => void;

export default function ActionsPanel(): JSX.Element {
  const appStore = useAppStore();
  const appState = appStore.getState();
  const { appName, modelName } = useParams<EntityDetailsRoute>();
  const getModelUUIDMemo = useMemo(
    () => (modelName ? getModelUUID(modelName) : null),
    [modelName]
  );
  const modelUUID = useSelector((state: RootState) =>
    getModelUUIDMemo?.(state)
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

  const [queryParams, setQueryParams] = useQueryParams<{
    units: string[];
    panel: string | null;
  }>({ units: [], panel: null });
  const selectedUnits = queryParams.units;

  useEffect(() => {
    setFetchingActionData(true);
    if (appName && modelUUID) {
      getActionsForApplication(appName, modelUUID, appStore.getState()).then(
        (actions) => {
          if (actions?.results?.[0]?.actions) {
            setActionData(actions.results[0].actions);
          }
          setFetchingActionData(false);
        }
      );
    }
  }, [appName, appStore, modelUUID]);

  const namespace =
    appName && modelUUID
      ? appState.juju?.modelData?.[modelUUID]?.applications?.[appName]?.charm
      : null;

  const generateSelectedUnitList = () => {
    if (!selectedUnits.length) {
      return "0 units selected";
    }
    return selectedUnits.reduce((acc, unitName) => {
      return `${acc}, ${unitName.split("/")[1]}`;
    });
  };

  const generateTitle = () => {
    const unitLength = selectedUnits.length;
    return (
      <h5>
        {appName && namespace ? (
          <CharmIcon name={appName} charmId={namespace} />
        ) : null}{" "}
        {unitLength} {pluralize(unitLength, "unit")} selected
      </h5>
    );
  };

  const executeAction = async () => {
    // You shouldn't be able to get this far without this defined but jic.
    if (!selectedAction || !modelUUID) return;
    await executeActionOnUnits(
      selectedUnits,
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
    (actionName: string, values: ActionOptionValue) => {
      onValuesChange(actionName, values, actionOptionsValues);
      enableSubmit(
        selectedAction,
        selectedUnits,
        actionData,
        actionOptionsValues,
        setDisableSubmit
      );
    },
    [actionData, selectedAction, selectedUnits]
  );

  const selectHandler = useCallback(
    (actionName: string) => {
      setSelectedAction(actionName);
      enableSubmit(
        actionName,
        selectedUnits,
        actionData,
        actionOptionsValues,
        setDisableSubmit
      );
    },
    [actionData, selectedUnits]
  );

  const generateConfirmationModal = () => {
    if (confirmType && selectedAction) {
      // Allow for adding more confirmation types, like for cancel
      // if inputs have been changed.
      if (confirmType === "submit") {
        return SubmitConfirmation(
          selectedAction,
          selectedUnits.length,
          selectedUnits,
          () => {
            setConfirmType("");
            executeAction();
            setQueryParams(null);
          },
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
        <div
          className="actions-panel__unit-list"
          data-testid="actions-panel-unit-list"
        >
          Run action on: {generateSelectedUnitList()}
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
    // Use toString to convert booleans to strings as this is what the API requires.
    updatedValues[key.replace(`${actionName}-`, "")] = values[key].toString();
  });

  optionValues.current = {
    ...optionValues.current,
    [actionName]: updatedValues,
  };
}

export function enableSubmit(
  selectedAction: string | undefined,
  selectedUnits: string[],
  actionData: ActionData,
  optionsValues: MutableRefObject<ActionOptionValues>,
  setDisableSubmit: (disable: boolean) => void
) {
  if (selectedAction && selectedUnits.length > 0) {
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
  return !required.some((option) => {
    const optionType = actionData[selected].params.properties[option].type;
    const value = optionsValues[selected][option];
    return optionType === "boolean" ? value !== "true" : value === "";
  });
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
          <div className="p-confirmation-modal__sub-header">UNIT COUNT</div>
          <div data-testid="confirmation-modal-unit-count">{unitCount}</div>
        </div>
        <div className="p-confirmation-modal__info-group">
          <div className="p-confirmation-modal__sub-header">UNIT NAME</div>
          <div data-testid="confirmation-modal-unit-names">{unitNames}</div>
        </div>
      </div>
    </ConfirmationModal>
  );
}
