import { Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { startModelWatcher, stopModelWatcher } from "juju/api";
import { actions as jujuActions } from "store/juju";

import { getModelUUIDFromList } from "store/juju/selectors";
import { EntityDetailsRoute } from "components/Routes/Routes";

import Model from "pages/EntityDetails/Model/Model";
import App from "pages/EntityDetails/App/App";
import Unit from "pages/EntityDetails/Unit/Unit";
import Machine from "pages/EntityDetails/Machine/Machine";
import { useAppStore } from "store/store";
import { Connection } from "@canonical/jujulib";
import { AllWatcherId } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import EntityDetails from "pages/EntityDetails/EntityDetails";
import urls from "urls";

export default function ModelDetails() {
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));

  useEffect(() => {
    let conn: Connection | null = null;
    let pingerIntervalId: number | null = null;
    let watcherHandle: AllWatcherId | null = null;

    async function loadFullData() {
      const response = await startModelWatcher(modelUUID, appState, dispatch);
      conn = response?.conn ?? null;
      watcherHandle = response?.watcherHandle ?? null;
      pingerIntervalId = response?.pingerIntervalId ?? null;
      // Fetch the missing model status data. This data should eventually make
      // its way into the all watcher at which point we can drop this additional
      // request for data.
      // https://bugs.launchpad.net/juju/+bug/1939341
      const status = await conn?.facades.client.fullStatus();
      if (status !== null) {
        dispatch(
          jujuActions.populateMissingAllWatcherData({ uuid: modelUUID, status })
        );
      }
    }
    if (modelUUID) {
      loadFullData();
    }
    return () => {
      if (watcherHandle && pingerIntervalId && conn) {
        stopModelWatcher(conn, watcherHandle["watcher-id"], pingerIntervalId);
      }
    };
    // Skipped as we need appState due to the call to `connectAndLoginToModel`
    // this method will need to be updated to take specific values instead of
    // the entire state.
    // eslint-disable-next-line
  }, [modelUUID]);

  const detailsRoute = urls.model.index(null);
  return (
    <Routes>
      <Route path="*" element={<EntityDetails />}>
        <Route path="" element={<Model />} />
        <Route
          path={urls.model.app.index(null, detailsRoute)}
          element={<App />}
        />
        <Route path={urls.model.unit(null, detailsRoute)} element={<Unit />} />
        <Route
          path={urls.model.machine(null, detailsRoute)}
          element={<Machine />}
        />
      </Route>
    </Routes>
  );
}
