import type { AllWatcherNextResults } from "@canonical/jujulib/dist/api/facades/all-watcher/AllWatcherV3";
import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import type { AllWatcherDelta } from "juju/types";
import EntityDetails from "pages/EntityDetails";
import App from "pages/EntityDetails/App";
import Machine from "pages/EntityDetails/Machine";
import Model from "pages/EntityDetails/Model";
import Unit from "pages/EntityDetails/Unit";
import { actions as jujuActions } from "store/juju";
import { getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";
import { getMajorMinorVersion, toErrorString } from "utils";

import useModelWatcher from "./useModelWatcher";

/**
 * Type guard for arrays which contain all watcher deltas.
 */
function isDeltas(
  deltas: AllWatcherNextResults["deltas"],
): deltas is AllWatcherDelta[] {
  return (
    deltas.length > 0 &&
    Array.isArray(deltas[0]) &&
    deltas[0].length === 3 &&
    typeof deltas[0][0] === "string" &&
    typeof deltas[0][1] === "string" &&
    typeof deltas[0][2] === "object"
  );
}

export default function ModelDetails(): JSX.Element {
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const [modelError, setModelError] = useState<null | string>(null);

  const {
    conn,
    deltas,
    error: modelWatcherError,
    ready: watcherReady,
  } = useModelWatcher(modelUUID);

  const loadAdditionalData = useCallback(async () => {
    const status = await conn?.facades.client?.fullStatus({
      patterns: [],
    });

    if (status) {
      dispatch(
        jujuActions.populateMissingAllWatcherData({
          uuid: modelUUID,
          status,
        }),
      );
    }
  }, [dispatch, modelUUID, conn]);

  // Fetch additional model data for pre Juju 3.2.
  useEffect(() => {
    if (
      !watcherReady ||
      getMajorMinorVersion(conn?.info.serverVersion) >= 3.2
    ) {
      return;
    }

    loadAdditionalData().catch((err) => {
      setModelError(toErrorString(err));
    });
  }, [conn?.info.serverVersion, loadAdditionalData, watcherReady]);

  // Process deltas as they arrive.
  useEffect(() => {
    if (!isDeltas(deltas)) {
      return;
    }

    dispatch(jujuActions.processAllWatcherDeltas(deltas));
  }, [dispatch, deltas]);

  const detailsRoute = urls.model.index(null);
  return (
    <Routes>
      <Route
        path="*"
        element={
          <EntityDetails modelWatcherError={modelError || modelWatcherError} />
        }
      >
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
