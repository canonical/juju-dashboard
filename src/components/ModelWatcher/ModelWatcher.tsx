import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { startModelWatcher, stopModelWatcher } from "juju/index";
import { populateMissingAllWatcherData } from "juju/actions";

import type { ReactNode } from "react";
import type { TSFixMe } from "types";

type Props = {
  children: ReactNode;
};

export default function ModelWatcher({ children }: Props): JSX.Element {
  const appState = useStore().getState();
  const dispatch = useDispatch();

  useEffect(() => {
    let conn: TSFixMe = null;
    let pingerIntervalId: number | null = null;
    let watcherHandle: TSFixMe = null;

    async function loadFullData() {
      ({ conn, watcherHandle, pingerIntervalId } = await startModelWatcher(
        uuid,
        appState,
        dispatch
      ));
      // Fetch the missing model status data. This data should eventually make
      // its way into the all watcher at which point we can drop this additional
      // request for data.
      // https://bugs.launchpad.net/juju/+bug/1939341
      const status = await conn.facades.client.fullStatus();
      if (status !== null) {
        dispatch(populateMissingAllWatcherData(uuid, status));
      }
    }
    if (uuid) {
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
  }, [uuid]);

  return children;
}
