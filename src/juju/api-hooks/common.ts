import { useCallback } from "react";
import { useSelector } from "react-redux";

import { connectToModel } from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import { getConfig, getUserPass } from "store/general/selectors";
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

export const useModelConnectionCallback = (modelUUID?: string) => {
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const identityProviderAvailable =
    useAppSelector(getConfig)?.identityProviderAvailable;
  const credentials = useAppSelector((state) =>
    getUserPass(state, wsControllerURL),
  );

  return useCallback(
    (response: ModelConnectionCallback) => {
      if (!wsControllerURL || !modelUUID) {
        response({ error: Label.NO_CONNECTION_ERROR });
        return;
      }
      connectToModel(
        modelUUID,
        wsControllerURL,
        credentials,
        identityProviderAvailable,
      )
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
    [credentials, identityProviderAvailable, modelUUID, wsControllerURL],
  );
};

export const useCallWithConnectionPromise = <R, A extends unknown[]>(
  handler: CallHandler<R, A>,
  userName?: string,
  modelName?: string,
) => {
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(
    (...args: A) => {
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
  userName?: string,
  modelName?: string,
) => {
  const callbackHandler = useCallback(
    (connection: ConnectionWithFacades, ...args: A) => {
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
