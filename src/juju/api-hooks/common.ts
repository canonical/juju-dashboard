import { useCallback } from "react";

import { connectToModel, loginWithBakery } from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { getUserPass, getWSControllerURL } from "store/general/selectors";
import { getModelByUUID, getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { toErrorString } from "utils";

export enum Label {
  NO_CONNECTION_ERROR = "Unable to connect to model",
  NO_CONTROLLER_CONNECTION_ERROR = "Unable to connect to controller",
}

type ConnectionCallback = (
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
  modelUUID?: null | string,
): ((response: ConnectionCallback) => void) => {
  const wsControllerURL =
    useAppSelector((state) => getModelByUUID(state, modelUUID))
      ?.wsControllerURL ?? null;
  const credentials = useAppSelector((state) =>
    getUserPass(state, wsControllerURL),
  );

  return useCallback(
    (response: ConnectionCallback) => {
      if (!wsControllerURL || !modelUUID) {
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

export const useControllerConnectionCallback = (): ((
  response: ConnectionCallback,
) => void) => {
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? null;
  const credentials = useAppSelector((state) =>
    getUserPass(state, wsControllerURL),
  );

  return useCallback(
    (response: ConnectionCallback) => {
      if (!wsControllerURL) {
        response({ error: Label.NO_CONTROLLER_CONNECTION_ERROR });
        return;
      }
      loginWithBakery(wsControllerURL, credentials)
        .then(({ conn }) => {
          if (!conn) {
            response({ error: Label.NO_CONTROLLER_CONNECTION_ERROR });
            return null;
          }
          response({ connection: conn });
          return null;
        })
        .catch((error) => {
          response({ error: toErrorString(error) });
        });
    },
    [credentials, wsControllerURL],
  );
};

export const useCallWithConnectionPromise = <R, A extends unknown[]>(
  handler: CallHandler<R, A>,
  qualifier?: null | string,
  modelName?: null | string,
): ((...args: A) => Promise<R>) => {
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
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
  qualifier?: null | string,
  modelName?: null | string,
): ((...args: A) => void) => {
  const callbackHandler = useCallback(
    async (connection: ConnectionWithFacades, ...args: A) => {
      return handler(connection, ...(args ?? []));
    },
    [handler],
  );
  const makeCall = useCallWithConnectionPromise<R, A>(
    callbackHandler,
    qualifier,
    modelName,
  );
  return useCallback(
    (...args: A) => {
      makeCall(...(args ?? []))
        .then(onSuccess)
        .catch((error) => {
          onError(toErrorString(error));
        });
    },
    [makeCall, onError, onSuccess],
  );
};

export const useCallWithControllerConnectionPromise = <R, A extends unknown[]>(
  handler: CallHandler<R, A>,
): ((...args: A) => Promise<R>) => {
  const controllerConnectionCallback = useControllerConnectionCallback();
  return useCallback(
    async (...args: A) => {
      return new Promise<R>((resolve, reject) => {
        controllerConnectionCallback((result) => {
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
    [controllerConnectionCallback, handler],
  );
};

export const useCallWithControllerConnection = <R, A extends unknown[]>(
  handler: CallHandler<R, A>,
  onSuccess: (response: R) => void,
  onError: (error: string) => void,
): ((...args: A) => void) => {
  const callbackHandler = useCallback(
    async (connection: ConnectionWithFacades, ...args: A) => {
      return handler(connection, ...(args ?? []));
    },
    [handler],
  );
  const makeCall = useCallWithControllerConnectionPromise<R, A>(
    callbackHandler,
  );
  return useCallback(
    (...args: A) => {
      makeCall(...(args ?? []))
        .then(onSuccess)
        .catch((error) => {
          onError(toErrorString(error));
        });
    },
    [makeCall, onError, onSuccess],
  );
};
