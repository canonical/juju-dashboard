import { useEffect, useMemo, useRef, useState, MutableRefObject } from "react";
import classNames from "classnames";
import { DefaultRootState, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";
import { Formik } from "formik";
import { executeActionOnUnits, getActionsForApplication } from "juju";
import { getModelUUID } from "app/selectors";
import { generateIconImg } from "app/utils/utils";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";
import RadioInputBox from "components/RadioInputBox/RadioInputBox";

import "./_actions-panel.scss";

type ActionData = {
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

export type ActionOptions = ActionOptionDetails[];

type ActionOptionDetails = {
  name: string;
  description: string;
  type: string;
  required: boolean;
};

type ActionOptionValues = {
  [key: string]: ActionOptionValue;
};

export type ActionOptionValue = {
  [key: string]: string;
};

export type SetSelectedAction = (actionName: string) => void;

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

  const [actionData, setActionData] = useState<ActionData>();
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

  const generateSelectedUnitList = () => "...";

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

  const enableSubmit = () => {
    // XXX If an action has been selected
    // XXX If all required fields have been populated
    // XXX If all fields validate.
    return false;
  };

  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={generateTitle()} />
        <div className="actions-panel__unit-list">
          Run action on {appName}: {generateSelectedUnitList()}
        </div>
        <div className="actions-panel__action-list">
          {generateActionlist(
            actionData,
            actionOptionsValues,
            fetchingActionData,
            selectedAction,
            setSelectedAction
          )}
        </div>
        <div className="actions-panel__drawer">
          <button
            className={classNames(
              "p-button--positive actions-panel__run-action"
            )}
            disabled={!enableSubmit()}
            onClick={executeAction}
          >
            Run action
          </button>
        </div>
      </div>
    </Aside>
  );
}

function generateActionlist(
  actionData: ActionData | undefined,
  actionOptionValues: MutableRefObject<ActionOptionValues>,
  fetchingActionData: boolean,
  selectedAction: string | undefined,
  setSelectedAction: SetSelectedAction
) {
  if (!actionData && fetchingActionData) return null;
  if (!actionData && !fetchingActionData)
    return <div>This charm has not provided any actions</div>;
  if (!actionData) return null;

  const onValuesChange = (actionName: string, values: ActionOptionValue) => {
    // The keys have the action name as a prefix because of the form field ID's
    // needing to be unique so we strip them off when storing them.
    const newValues: ActionOptionValue = {};
    Object.keys(values).forEach((key) => {
      newValues[key.replace(`${actionName}-`, "")] = values[key];
    });
    actionOptionValues.current[actionName] = newValues;
  };

  return Object.keys(actionData).map((actionName) => {
    const action = actionData[actionName];
    const options: ActionOptions = [];

    Object.keys(action.params.properties).forEach((name) => {
      const property = action.params.properties[name];
      options.push({
        name: name,
        description: property.description,
        type: property.type,
        required: action.params.required.includes(name),
      });
    });

    const generateInitialValues = (name: string, options: ActionOptions) => {
      const initialValues: { [key: string]: string } = {};
      options.forEach((option) => {
        initialValues[`${name}-${option.name}`] = "";
      });
      return initialValues;
    };

    return (
      <Formik
        initialValues={generateInitialValues(actionName, options)}
        onSubmit={() => {}}
        key={actionName}
      >
        <RadioInputBox
          name={actionName}
          description={action.description}
          options={options}
          onSelect={setSelectedAction}
          onValuesChange={onValuesChange}
          selectedAction={selectedAction}
        />
      </Formik>
    );
  });
}
