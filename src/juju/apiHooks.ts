import type {
  SecretsFilter,
  ListSecretsArgs,
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

export const useModelConnection = (
  response: (
    conn?: ConnectionWithFacades | null,
    error?: string | null,
  ) => void,
  modelUUID?: string,
) => {
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const identityProviderAvailable =
    useAppSelector(getConfig)?.identityProviderAvailable;
  const credentials = useAppSelector((state) =>
    getUserPass(state, wsControllerURL),
  );

  useEffect(() => {
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
  }, [
    response,
    credentials,
    identityProviderAvailable,
    modelUUID,
    wsControllerURL,
  ]);
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

  const fetchSecrets = useCallback(
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
    [dispatch, filter, modelUUID, showSecrets, wsControllerURL],
  );

  useModelConnection(fetchSecrets, modelUUID);
};
