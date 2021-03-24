import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import cloneDeep from "clone-deep";
import { DefaultRootState, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";
import { executeActionOnUnits, getActionsForApplication } from "juju";
import { getModelUUID } from "app/selectors";
import { generateIconImg } from "app/utils/utils";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import Aside from "components/Aside/Aside";
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
  required: string[];
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
  [key: string]: ActionOptionValue;
};

type ActionOptionValue = {
  [key: string]: string;
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
    await executeActionOnUnits(
      // XXX These values are only hard coded until the
      // unit list selection has been implemented.
      ["ceph/0"],
      "delete-pool",
      actionOptionsValues.current["delete-pool"],
      modelUUID,
      appStore.getState()
    );
  };

  const onValuesChange = useCallback(
    (actionName: string, values: ActionOptionValue) => {
      // The keys have the action name as a prefix because of the form field ID's
      // needing to be unique so we strip them off when storing them.
      const newValues: ActionOptionValues = cloneDeep(
        actionOptionsValues.current
      );
      Object.keys(values).forEach((key) => {
        if (!newValues[actionName]) {
          newValues[actionName] = {};
        }
        newValues[actionName][key.replace(`${actionName}-`, "")] = values[key];
      });
      actionOptionsValues.current = newValues;
    },
    []
  );

  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={generateTitle()} />
        <div className="actions-panel__unit-list">
          Run action on {appName}: {generateSelectedUnitList()}
        </div>
        <div className="actions-panel__action-list">
          <LoadingHandler data={actionData} loading={fetchingActionData}>
            {Object.keys(actionData).map((actionName) => (
              <RadioInputBox
                name={actionName}
                description={actionData[actionName].description}
                onSelect={setSelectedAction}
                selectedInput={selectedAction}
                key={actionName}
              >
                <ActionOptions
                  name={actionName}
                  data={actionData}
                  onValuesChange={onValuesChange}
                />
              </RadioInputBox>
            ))}
          </LoadingHandler>
        </div>
        <div className="actions-panel__drawer">
          <button
            className={classNames(
              "p-button--positive actions-panel__run-action"
            )}
            disabled={disableSubmit}
            onClick={executeAction}
          >
            Run action
          </button>
        </div>
      </div>
    </Aside>
  );
}
