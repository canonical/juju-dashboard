import type {
  SecretsFilter,
  ListSecretsArgs,
  CreateSecretArgs,
  StringResults,
  ErrorResults,
  DeleteSecretArg,
  UpdateUserSecretArgs,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { useEffect, useCallback } from "react";
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

type ModelConnectionCallback = (
  conn?: ConnectionWithFacades | null,
  error?: string | null,
) => void;

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
        return;
      }
      connectToModel(
        modelUUID,
        wsControllerURL,
        credentials,
        identityProviderAvailable,
      )
        .then(response)
        .catch((error) => {
          response(null, error instanceof Error ? error.message : error);
        });
    },
    [credentials, identityProviderAvailable, modelUUID, wsControllerURL],
  );
};

export const useModelConnection = (
  response: ModelConnectionCallback,
  modelUUID?: string,
) => {
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);

  useEffect(() => {
    if (!modelUUID) {
      return;
    }
    modelConnectionCallback(response);
  }, [modelConnectionCallback, modelUUID, response]);
};

export const useListSecrets = (
  userName?: string,
  modelName?: string,
  filter?: SecretsFilter,
  showSecrets = false,
) => {
  const dispatch = useAppDispatch();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(() => {
    modelConnectionCallback(
      (connection?: ConnectionWithFacades | null, error?: string | null) => {
        if (error && wsControllerURL) {
          dispatch(
            jujuActions.setSecretsErrors({
              modelUUID,
              errors: error,
              wsControllerURL,
            }),
          );
          return;
        }
        if (!connection || !wsControllerURL) {
          return;
        }
        dispatch(jujuActions.secretsLoading({ modelUUID, wsControllerURL }));
        connection?.facades.secrets
          ?.listSecrets({
            ...(filter ? { filter } : {}),
            "show-secrets": showSecrets,
            // The type provided by Juju's schema.json has the filter as required.
          } as ListSecretsArgs)
          .then((secrets) => {
            dispatch(
              jujuActions.updateSecrets({
                modelUUID,
                secrets: secrets?.results ?? [],
                wsControllerURL,
              }),
            );
            return;
          })
          .catch((error) => {
            dispatch(
              jujuActions.setSecretsErrors({
                modelUUID,
                errors: error instanceof Error ? error.message : error,
                wsControllerURL,
              }),
            );
          });
      },
    );
  }, [
    dispatch,
    filter,
    modelConnectionCallback,
    modelUUID,
    showSecrets,
    wsControllerURL,
  ]);
};

export const useGetSecretContent = (userName?: string, modelName?: string) => {
  const dispatch = useAppDispatch();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(
    (secretURI: string, revision?: number) => {
      modelConnectionCallback(
        (connection?: ConnectionWithFacades | null, error?: string | null) => {
          if (error && wsControllerURL) {
            dispatch(
              jujuActions.setSecretsContentErrors({
                modelUUID,
                errors: error,
                wsControllerURL,
              }),
            );
            return;
          }
          if (!connection || !wsControllerURL) {
            return;
          }
          dispatch(
            jujuActions.secretsContentLoading({ modelUUID, wsControllerURL }),
          );
          connection?.facades.secrets
            ?.listSecrets({
              filter: {
                revision,
                uri: secretURI,
              },
              "show-secrets": true,
            })
            .then((secrets) => {
              const content = secrets?.results[0]?.value;
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
              return;
            })
            .catch((error) => {
              dispatch(
                jujuActions.setSecretsContentErrors({
                  modelUUID,
                  errors: error instanceof Error ? error.message : error,
                  wsControllerURL,
                }),
              );
            });
        },
      );
    },
    [dispatch, modelConnectionCallback, modelUUID, wsControllerURL],
  );
};

export const useCreateSecrets = (userName?: string, modelName?: string) => {
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(
    (secrets: CreateSecretArgs["args"]) => {
      return new Promise<StringResults>((resolve, reject) => {
        modelConnectionCallback(
          (
            connection?: ConnectionWithFacades | null,
            error?: string | null,
          ) => {
            if (error) {
              reject(error);
              return;
            }
            if (!connection) {
              reject(new Error("Unable to connect to model"));
              return;
            }
            connection.facades.secrets
              ?.createSecrets({ args: secrets })
              .then((response) => {
                resolve(response);
                return;
              })
              .catch((error) => reject(error));
          },
        );
      });
    },
    [modelConnectionCallback],
  );
};

export const useUpdateSecrets = (userName?: string, modelName?: string) => {
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(
    (secrets: UpdateUserSecretArgs["args"]) => {
      return new Promise<ErrorResults>((resolve, reject) => {
        modelConnectionCallback(
          (
            connection?: ConnectionWithFacades | null,
            error?: string | null,
          ) => {
            if (error) {
              reject(error);
              return;
            }
            if (!connection) {
              reject(new Error("Unable to connect to model"));
              return;
            }
            connection.facades.secrets
              ?.updateSecrets({ args: secrets })
              .then((response) => {
                resolve(response);
                return;
              })
              .catch((error) => reject(error));
          },
        );
      });
    },
    [modelConnectionCallback],
  );
};

export const useRemoveSecrets = (userName?: string, modelName?: string) => {
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const modelConnectionCallback = useModelConnectionCallback(modelUUID);
  return useCallback(
    (secrets: Partial<DeleteSecretArg>[]) => {
      return new Promise<ErrorResults>((resolve, reject) => {
        modelConnectionCallback(
          (
            connection?: ConnectionWithFacades | null,
            error?: string | null,
          ) => {
            if (error) {
              reject(error);
              return;
            }
            if (!connection) {
              reject(new Error("Unable to connect to model"));
              return;
            }
            connection.facades.secrets
              // Cast to `DeleteSecretArg` as the API requires either label or
              // URI, but the type declares both as required.
              ?.removeSecrets({ args: secrets as DeleteSecretArg[] })
              .then((response) => {
                resolve(response);
                return;
              })
              .catch((error) => reject(error));
          },
        );
      });
    },
    [modelConnectionCallback],
  );
};
