import { Route, Switch, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { startModelWatcher, stopModelWatcher } from "juju/index";
import { populateMissingAllWatcherData } from "juju/actions";

import type { TSFixMe } from "types";
import { getModelUUIDByName } from "juju/model-selectors";
import { EntityDetailsRoute } from "components/Routes/Routes";

import Model from "pages/EntityDetails/Model/Model";
import App from "pages/EntityDetails/App/App";
import Unit from "pages/EntityDetails/Unit/Unit";
import Machine from "pages/EntityDetails/Machine/Machine";

export default function ModelDetails() {
  const appState = useStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDByName(modelName, userName));

  useEffect(() => {
    let conn: TSFixMe = null;
    let pingerIntervalId: number | null = null;
    let watcherHandle: TSFixMe = null;

    async function loadFullData() {
      ({ conn, watcherHandle, pingerIntervalId } = await startModelWatcher(
        modelUUID,
        appState,
        dispatch
      ));
      // Fetch the missing model status data. This data should eventually make
      // its way into the all watcher at which point we can drop this additional
      // request for data.
      // https://bugs.launchpad.net/juju/+bug/1939341
      const status = await conn.facades.client.fullStatus();
      if (status !== null) {
        dispatch(populateMissingAllWatcherData(modelUUID, status));
      }
    }
    if (modelUUID) {
      loadFullData();
    }
    return () => {
      if (watcherHandle) {
        stopModelWatcher(conn, watcherHandle["watcher-id"], pingerIntervalId);
      }
    };
    // Skipped as we need appState due to the call to `connectAndLoginToModel`
    // this method will need to be updated to take specific values instead of
    // the entire state.
    // eslint-disable-next-line
  }, [modelUUID]);

  return (
    <Switch>
      <Route path="/models/:userName/:modelName" exact>
        <Model />
      </Route>
      <Route path="/models/:userName/:modelName/app/:appName" exact>
        <App />
      </Route>
      <Route
        path="/models/:userName/:modelName/app/:appName/unit/:unitId"
        exact
      >
        <Unit />
      </Route>
      <Route path="/models/:userName/:modelName/machine/:machineId" exact>
        <Machine />
      </Route>
    </Switch>
  );
}
