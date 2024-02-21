import type {
  SecretsFilter,
  ListSecretsArgs,
  CreateSecretArgs,
  DeleteSecretArg,
  UpdateUserSecretArgs,
  GrantRevokeUserSecretArg,
  ListSecretResults,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { useCallback } from "react";
import { useSelector } from "react-redux";

import { connectToModel } from "juju/api";
import type { ConnectionWithFacades } from "juju/types";
import {
  getConfig,
  getUserPass,
  getWSControllerURL,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getModelByUUID, getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector, useAppDispatch } from "store/store";
import { toErrorString } from "utils";

export enum Label {
  NO_CONNECTION_ERROR = "Unable to connect to model",
  NO_SECRETS_FACADE_ERROR = "Secrets aren't supported for this model",
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

export const useListSecrets = (userName?: string, modelName?: string) => {
  const dispatch = useAppDispatch();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const onError = useCallback(
    (error: string) => {
      if (wsControllerURL) {
        dispatch(
          jujuActions.setSecretsErrors({
            modelUUID,
            errors: error,
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, modelUUID, wsControllerURL],
  );
  const onSuccess = useCallback(
    (response: ListSecretResults) => {
      if (wsControllerURL) {
        dispatch(
          jujuActions.updateSecrets({
            modelUUID,
            secrets: response?.results ?? [],
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, modelUUID, wsControllerURL],
  );
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      filter?: SecretsFilter,
      showSecrets = false,
    ) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      if (wsControllerURL) {
        dispatch(jujuActions.secretsLoading({ modelUUID, wsControllerURL }));
      }
      return connection.facades.secrets.listSecrets({
        ...(filter ? { filter } : {}),
        "show-secrets": showSecrets,
        // The type provided by Juju's schema.json has the filter as required.
      } as ListSecretsArgs);
    },
    [dispatch, modelUUID, wsControllerURL],
  );
  return useCallWithConnection(
    handler,
    onSuccess,
    onError,
    userName,
    modelName,
  );
};

export const useGetSecretContent = (userName?: string, modelName?: string) => {
  const dispatch = useAppDispatch();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector(getWSControllerURL);

  const onError = useCallback(
    (error: string) => {
      if (wsControllerURL) {
        dispatch(
          jujuActions.setSecretsContentErrors({
            modelUUID,
            errors: error,
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, modelUUID, wsControllerURL],
  );
  const onSuccess = useCallback(
    (response: ListSecretResults) => {
      if (wsControllerURL) {
        const content = response?.results[0]?.value;
        if (content?.error || !content?.data) {
          dispatch(
            jujuActions.setSecretsContentErrors({
              modelUUID,
              errors: content?.error?.message ?? "No secret data",
              wsControllerURL,
            }),
          );
          return;
        }
        dispatch(
          jujuActions.updateSecretsContent({
            modelUUID,
            content: content.data,
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, modelUUID, wsControllerURL],
  );
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      secretURI: string,
      revision?: number,
    ) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      if (wsControllerURL) {
        dispatch(
          jujuActions.secretsContentLoading({ modelUUID, wsControllerURL }),
        );
      }
      return connection.facades.secrets?.listSecrets({
        filter: {
          revision,
          uri: secretURI,
        },
        "show-secrets": true,
      });
    },
    [dispatch, modelUUID, wsControllerURL],
  );
  return useCallWithConnection(
    handler,
    onSuccess,
    onError,
    userName,
    modelName,
  );
};

export const useCreateSecrets = (userName?: string, modelName?: string) => {
  const handleCreate = useCallback(
    (connection: ConnectionWithFacades, secrets: CreateSecretArgs["args"]) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      return connection.facades.secrets?.createSecrets({
        args: secrets,
      });
    },
    [],
  );
  return useCallWithConnectionPromise(handleCreate, userName, modelName);
};

export const useUpdateSecrets = (userName?: string, modelName?: string) => {
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      secrets: UpdateUserSecretArgs["args"],
    ) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      return connection.facades.secrets?.updateSecrets({ args: secrets });
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useRemoveSecrets = (userName?: string, modelName?: string) => {
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      secrets: Partial<DeleteSecretArg>[],
    ) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      return (
        connection.facades.secrets
          // Cast to `DeleteSecretArg` as the API requires either label or
          // URI, but the type declares both as required.
          ?.removeSecrets({ args: secrets as DeleteSecretArg[] })
      );
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useGrantSecret = (userName?: string, modelName?: string) => {
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      secretURI: string,
      applications: string[],
    ) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      return (
        connection.facades.secrets
          // Cast to `GrantRevokeUserSecretArg` as the API requires either label or
          // URI, but the type declares both as required.
          ?.grantSecret({
            uri: secretURI,
            applications,
          } as GrantRevokeUserSecretArg)
      );
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};

export const useRevokeSecret = (userName?: string, modelName?: string) => {
  const handler = useCallback(
    (
      connection: ConnectionWithFacades,
      secretURI: string,
      applications: string[],
    ) => {
      if (!connection.facades.secrets) {
        throw new Error(Label.NO_SECRETS_FACADE_ERROR);
      }
      return (
        connection.facades.secrets
          // Cast to `GrantRevokeUserSecretArg` as the API requires either label or
          // URI, but the type declares both as required.
          ?.revokeSecret({
            uri: secretURI,
            applications,
          } as GrantRevokeUserSecretArg)
      );
    },
    [],
  );
  return useCallWithConnectionPromise(handler, userName, modelName);
};
