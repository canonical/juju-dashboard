import { useCallback } from "react";

import { connectToModel } from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { getUserPass } from "store/general/selectors";
import { getModelByUUID, getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { toErrorString } from "utils";

export enum Label {
  NO_CONNECTION_ERROR = "Unable to connect to model",
}

type ModelConnectionCallback = (
  result:
    | {
        connection: ConnectionWithFacades;
      }
    | {
        error: string;
      },
) => void;

type CallHandler<R, A extends unknown[]> =
  | ((connection: ConnectionWithFacades, ...args: A) => Promise<R>)
  | ((connection: ConnectionWithFacades) => Promise<R>);

export const useModelConnectionCallback = (
  modelUUID: null | string = null,
): ((response: ModelConnectionCallback) => void) => {
  const wsControllerURL =
    useAppSelector((state) => getModelByUUID(state, modelUUID))
      ?.wsControllerURL ?? null;
  const credentials = useAppSelector((state) =>
    getUserPass(state, wsControllerURL),
  );

  return useCallback(
    (response: ModelConnectionCallback) => {
      if (
        wsControllerURL === null ||
        !wsControllerURL ||
        modelUUID === null ||
        !modelUUID
      ) {
        // Don't attempt to make the call until the model and controller details
        // are available.
        return;
      }
      connectToModel(modelUUID, wsControllerURL, credentials)
        .then((connection) => {
          if (!connection) {
            response({ error: Label.NO_CONNECTION_ERROR });
            return;
          }
          response({ connection });
          return;
        })
        .catch((error) => {
          response({ error: toErrorString(error) });
        });
    },
    [credentials, modelUUID, wsControllerURL],
  );
};

export const useCallWithConnectionPromise = <R, A extends unknown[]>(
  handler: CallHandler<R, A>,
  userName: null | string,
  modelName: null | string,
): ((...args: A) => Promise<R>) => {
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(
    async (...args: A) => {
      return new Promise<R>((resolve, reject) => {
        modelConnectionCallback((result) => {
          if ("error" in result) {
            reject(result.error);
            return;
          }
          handler(result.connection, ...args)
            .then(resolve)
            .catch(reject);
        });
      });
    },
    [handler, modelConnectionCallback],
  );
};

export const useCallWithConnection = <R, A extends unknown[]>(
  handler: CallHandler<R, A>,
  onSuccess: (response: R) => void,
  onError: (error: string) => void,
  userName: null | string = null,
  modelName: null | string = null,
): ((...args: A) => void) => {
  const callbackHandler = useCallback(
    async (connection: ConnectionWithFacades, ...args: A) => {
      return handler(connection, ...(args ?? []));
    },
    [handler],
  );
  const makeCall = useCallWithConnectionPromise<R, A>(
    callbackHandler,
    userName,
    modelName,
  );
  return useCallback(
    (...args: A) => {
      makeCall(...(args ?? []))
        .then(onSuccess)
        .catch((error) => onError(toErrorString(error)));
    },
    [makeCall, onError, onSuccess],
  );
};
