import { useEffect, useMemo, useState } from "react";
import { DefaultRootState, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";
import { getActionsForApplication } from "juju";
import { getModelUUID } from "app/selectors";
import { generateIconImg } from "app/utils/utils";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import Aside from "components/Aside/Aside";
import PanelHeader from "components/PanelHeader/PanelHeader";

import "./_actions-panel.scss";

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
  const [actionData, setActionData] = useState();

  console.log(actionData);

  useEffect(() => {
    getActionsForApplication(appName, modelUUID, appStore.getState()).then(
      (actions) => {
        if (actions?.results?.[0]?.actions) {
          setActionData(actions.results[0].actions);
        }
      }
    );
  }, [appName, appStore, modelUUID]);

  // See above note about selectors.js typings TSFixMe
  const namespace =
    appState.juju?.modelData?.[modelUUID as string]?.applications?.[appName]
      ?.charm;

  const generateSelectedUnitList = () => "1, 2, 3";

  const generateTitle = () => (
    <h5>{generateIconImg(appName, namespace)} 3 units selected</h5>
  );

  return (
    <Aside width="narrow">
      <div className="p-panel actions-panel">
        <PanelHeader title={generateTitle()} />
        <div className="actions-panel__unit-list">
          Run action on {appName}: {generateSelectedUnitList()}
        </div>
      </div>
    </Aside>
  );
}
