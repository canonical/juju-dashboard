import type { ActionSpec } from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import {
  ActionButton,
  Button,
  ConfirmationModal,
} from "@canonical/react-components";
import type { MutableRefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import usePortal from "react-useportal";

import CharmIcon from "components/CharmIcon/CharmIcon";
import LoadingHandler from "components/LoadingHandler/LoadingHandler";
import Panel from "components/Panel";
import RadioInputBox from "components/RadioInputBox/RadioInputBox";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import useInlineErrors from "hooks/useInlineErrors";
import {
  useExecuteActionOnUnits,
  useGetActionsForApplication,
} from "juju/api-hooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import { getModelUUID } from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import type { RootState } from "store/store";
import { useAppStore } from "store/store";

import ActionOptions from "./ActionOptions";

export enum Label {
  CANCEL_BUTTON = "Cancel",
  CONFIRM_BUTTON = "Confirm",
  NO_UNITS_SELECTED = "0 units selected",
  NO_ACTIONS_PROVIDED = "This charm has not provided any actions.",
  GET_ACTIONS_ERROR = "Unable to get actions for application.",
  EXECUTE_ACTION_ERROR = "Couldn't start the action.",
}

export enum TestId {
  PANEL = "actions-panel",
}

export type ActionData = Record<string, ActionSpec>;

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
  options: ActionOptionValue,
) => void;

type ActionsQueryParams = {
  panel?: string | null;
  units?: string[];
};

enum InlineErrors {
  GET_ACTION = "get-action",
  EXECUTE_ACTION = "execute-action",
}

export default function ActionsPanel(): JSX.Element {
  const appStore = useAppStore();
  const appState = appStore.getState();
  const { appName, modelName, userName } = useParams<EntityDetailsRoute>();
  const getModelUUIDMemo = useMemo(
    () => (modelName ? getModelUUID(modelName) : null),
    [modelName],
  );
  const modelUUID = useSelector((state: RootState) =>
    getModelUUIDMemo?.(state),
  );
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [actionData, setActionData] = useState<ActionData>({});
  const [fetchingActionData, setFetchingActionData] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);
  const getActionsForApplication = useGetActionsForApplication(
    userName,
    modelName,
  );
  const executeActionOnUnits = useExecuteActionOnUnits(userName, modelName);
  const [selectedAction, setSelectedAction]: [
    string | undefined,
    SetSelectedAction,
  ] = useState<string>();
  const [inlineErrors, setInlineErrors, hasInlineError] = useInlineErrors({
    [InlineErrors.GET_ACTION]: (error) => (
      // If get actions for application fails, we add a button for
      // refetching the actions data to the first inline error.
      <>
        {error} Try{" "}
        <Button
          appearance="link"
          onClick={() => getActionsForApplicationCallback()}
        >
          refetching
        </Button>{" "}
        the actions data.
      </>
    ),
  });
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const scrollArea = useRef<HTMLDivElement>(null);
  const { Portal } = usePortal();

  const actionOptionsValues = useRef<ActionOptionValues>({});

  const defaultQueryParams: ActionsQueryParams = { panel: null, units: [] };
  const [queryParams, , handleRemovePanelQueryParams] =
    usePanelQueryParams<ActionsQueryParams>(defaultQueryParams);
  const selectedUnits = useMemo(
    () => queryParams.units ?? [],
    [queryParams.units],
  );

  const getActionsForApplicationCallback = useCallback(() => {
    setFetchingActionData(true);
    if (appName && modelUUID) {
      getActionsForApplication(appName)
        .then((actions) => {
          if (actions?.results?.[0]?.actions) {
            setActionData(actions.results[0].actions);
          }
          setInlineErrors(InlineErrors.GET_ACTION, null);
          return;
        })
        .catch((error) => {
          setInlineErrors(InlineErrors.GET_ACTION, Label.GET_ACTIONS_ERROR);
          console.error(Label.GET_ACTIONS_ERROR, error);
        })
        .finally(() => {
          setFetchingActionData(false);
        });
    }
  }, [appName, getActionsForApplication, modelUUID, setInlineErrors]);

  useEffect(() => {
    getActionsForApplicationCallback();
  }, [getActionsForApplicationCallback]);

  const namespace =
    appName && modelUUID
      ? appState.juju?.modelData?.[modelUUID]?.applications?.[appName]?.charm
      : null;

  const generateSelectedUnitList = useCallback(() => {
    if (!selectedUnits.length) {
      return Label.NO_UNITS_SELECTED;
    }
    return selectedUnits.reduce((acc, unitName) => {
      return `${acc}, ${unitName.split("/")[1]}`;
    });
  }, [selectedUnits]);

  const generateTitle = () => {
    const unitLength = selectedUnits.length;
    return (
      <>
        {appName && namespace ? (
          <CharmIcon name={appName} charmId={namespace} />
        ) : null}{" "}
        {unitLength} {pluralize(unitLength, "unit")} selected
      </>
    );
  };

  const executeAction = async () => {
    // You shouldn't be able to get this far without this defined but jic.
    if (!selectedAction || !modelUUID) return;
    await executeActionOnUnits(
      selectedUnits,
      selectedAction,
      actionOptionsValues.current[selectedAction],
    );
  };

  const handleSubmit = () => {
    setConfirmType(ConfirmType.SUBMIT);
  };

  const changeHandler = useCallback(
    (actionName: string, values: ActionOptionValue) => {
      onValuesChange(actionName, values, actionOptionsValues);
      enableSubmit(
        selectedAction,
        selectedUnits,
        actionData,
        actionOptionsValues,
        setDisableSubmit,
      );
    },
    [actionData, selectedAction, selectedUnits],
  );

  const selectHandler = useCallback(
    (actionName: string) => {
      setSelectedAction(actionName);
      enableSubmit(
        actionName,
        selectedUnits,
        actionData,
        actionOptionsValues,
        setDisableSubmit,
      );
    },
    [actionData, selectedUnits],
  );

  const generateConfirmationModal = () => {
    if (confirmType && selectedAction) {
      // Allow for adding more confirmation types, like for cancel
      // if inputs have been changed.
      if (confirmType === ConfirmType.SUBMIT) {
        const unitNames = selectedUnits.reduce((acc, unitName) => {
          return `${acc}, ${unitName.split("/")[1]}`;
        });
        // Render the submit confirmation modal.
        return (
          <Portal>
            <ConfirmationModal
              title={`Run ${selectedAction}?`}
              cancelButtonLabel={Label.CANCEL_BUTTON}
              confirmButtonLabel={Label.CONFIRM_BUTTON}
              confirmButtonAppearance="positive"
              onConfirm={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                // Stop propagation of the click event in order for the Panel
                // to remain open after an error occurs in executeAction().
                // Remove this manual fix once this issue gets resolved:
                // https://github.com/canonical/react-components/issues/1032
                event.nativeEvent.stopImmediatePropagation();
                setConfirmType(null);
                setIsExecutingAction(true);
                executeAction()
                  .then(() => {
                    handleRemovePanelQueryParams();
                    return;
                  })
                  .catch((error) => {
                    setInlineErrors(
                      InlineErrors.EXECUTE_ACTION,
                      Label.EXECUTE_ACTION_ERROR,
                    );
                    setIsExecutingAction(false);
                    console.error(Label.EXECUTE_ACTION_ERROR, error);
                  });
              }}
              close={() => setConfirmType(null)}
            >
              <h4 className="p-muted-heading u-no-margin--bottom">
                UNIT COUNT
              </h4>
              <p data-testid="confirmation-modal-unit-count">
                {selectedUnits.length}
              </p>
              <h4 className="p-muted-heading u-no-margin--bottom u-no-padding--top">
                UNIT NAME
              </h4>
              <p data-testid="confirmation-modal-unit-names">{unitNames}</p>
            </ConfirmationModal>
          </Portal>
        );
      }
    }
  };

  const data = Object.keys(actionData).length > 0 ? actionData : null;

  return (
    <Panel
      drawer={
        <ActionButton
          appearance="positive"
          loading={isExecutingAction}
          disabled={disableSubmit || isExecutingAction}
          onClick={handleSubmit}
        >
          Run action
        </ActionButton>
      }
      width="narrow"
      data-testid={TestId.PANEL}
      title={generateTitle()}
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
      ref={scrollArea}
    >
      <PanelInlineErrors
        inlineErrors={inlineErrors}
        scrollArea={scrollArea.current}
      />
      <p data-testid="actions-panel-unit-list">
        Run action on: {generateSelectedUnitList()}
      </p>
      <LoadingHandler
        hasData={!!data}
        loading={fetchingActionData}
        noDataMessage={
          hasInlineError(InlineErrors.GET_ACTION)
            ? ""
            : Label.NO_ACTIONS_PROVIDED
        }
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
      {generateConfirmationModal()}
    </Panel>
  );
}

export function onValuesChange(
  actionName: string,
  values: ActionOptionValue,
  optionValues: MutableRefObject<ActionOptionValues>,
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
  setDisableSubmit: (disable: boolean) => void,
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
  optionValues: ActionOptionValues,
) => boolean;

type RequiredPopulated = (
  selectedAction: string,
  actionData: ActionData,
  optionValues: ActionOptionValues,
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
  optionsValues,
) => {
  const required: ActionParams["required"] =
    actionData[selected].params.required;
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
