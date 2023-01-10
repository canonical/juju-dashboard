import { Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { startModelWatcher, stopModelWatcher } from "juju/api";
import { populateMissingAllWatcherData } from "juju/actions";

import type { TSFixMe } from "types";
import { getModelUUID } from "juju/model-selectors";
import { EntityDetailsRoute } from "components/Routes/Routes";

import Model from "pages/EntityDetails/Model/Model";
import App from "pages/EntityDetails/App/App";
import Unit from "pages/EntityDetails/Unit/Unit";
import Machine from "pages/EntityDetails/Machine/Machine";
import { useAppStore } from "store/store";

export default function ModelDetails() {
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUID(modelName, userName));

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
      if (watcherHandle && pingerIntervalId) {
        stopModelWatcher(conn, watcherHandle["watcher-id"], pingerIntervalId);
      }
    };
    // Skipped as we need appState due to the call to `connectAndLoginToModel`
    // this method will need to be updated to take specific values instead of
    // the entire state.
    // eslint-disable-next-line
  }, [modelUUID]);

  return (
    <Routes>
      <Route path="/" element={<Model />} />
      <Route path="app/:appName" element={<App />} />
      <Route path="app/:appName/unit/:unitId" element={<Unit />} />
      <Route path="machine/:machineId" element={<Machine />} />
    </Routes>
  );
}
