import type { AllWatcherNextResults } from "@canonical/jujulib/dist/api/facades/all-watcher/AllWatcherV3";
import { useCallback, useEffect, useRef, useState } from "react";

import { startModelWatcher, stopModelWatcher } from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { useAppStore } from "store/store";
import { toErrorString } from "utils";

export type ModelWatcherResult = {
  deltas: AllWatcherNextResults["deltas"];
  error: null | string;
  ready: boolean;
  conn: ConnectionWithFacades | undefined;
};

export default function useModelWatcher(modelUUID: string): ModelWatcherResult {
  const appState = useAppStore().getState();

  const [deltas, setDeltas] = useState<AllWatcherNextResults["deltas"]>([]);
  const [error, setError] = useState<null | string>(null);

  const watcherData =
    useRef<Awaited<ReturnType<typeof startModelWatcher>>>(null);
  const [watcherReady, setWatcherReady] = useState(false);

  useEffect(() => {
    setError(null);
    setWatcherReady(false);

    void (async (): Promise<void> => {
      try {
        // Start the watcher.
        watcherData.current = await startModelWatcher(modelUUID, appState);

        // Successfully started the model watcher.
        setError(null);
        setWatcherReady(true);
      } catch (err) {
        setError(toErrorString(err));
        setWatcherReady(false);
      }
    })();

    return (): void => {
      const { conn, watcherHandle, pingerIntervalId } =
        watcherData.current ?? {};

      setWatcherReady(false);

      if (conn && watcherHandle && pingerIntervalId !== undefined) {
        void stopModelWatcher(
          conn,
          watcherHandle["watcher-id"],
          pingerIntervalId,
        );
      }
    };
  }, [modelUUID, appState]);

  const getNextDeltas = useCallback(async (): Promise<void> => {
    if (!watcherReady) {
      return;
    }

    const result = await watcherData.current?.next().catch((err) => {
      setError(toErrorString(err));
    });
    if (!result) {
      return;
    }

    setDeltas(result.deltas);
  }, [watcherReady]);

  // Trigger loading of the next deltas whenever an existing set of deltas is loaded.
  useEffect(() => {
    if (!watcherReady) {
      return;
    }

    void getNextDeltas();
  }, [watcherReady, deltas, getNextDeltas]);

  return {
    deltas,
    error,
    ready: watcherReady,
    conn: watcherData.current?.conn,
  };
}
