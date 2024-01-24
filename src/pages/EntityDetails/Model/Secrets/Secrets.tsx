import { Notification } from "@canonical/react-components";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import LoadingSpinner from "components/LoadingSpinner";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useListSecrets } from "juju/apiHooks";
import { actions as jujuActions } from "store/juju";
import {
  getSecretsLoaded,
  getSecretsLoading,
  getModelSecrets,
  getModelByUUID,
  getModelUUIDFromList,
  getSecretsErrors,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

export enum TestId {
  SECRETS_TABLE = "secrets-table",
  SECRETS_TAB = "secrets-tab",
}

const Secrets = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const dispatch = useAppDispatch();
  const modelUUID = useAppSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const secrets = useAppSelector((state) => getModelSecrets(state, modelUUID));
  const secretsErrors = useAppSelector((state) =>
    getSecretsErrors(state, modelUUID),
  );
  const secretsLoaded = useAppSelector((state) =>
    getSecretsLoaded(state, modelUUID),
  );
  const secretsLoading = useAppSelector((state) =>
    getSecretsLoading(state, modelUUID),
  );

  useListSecrets(userName, modelName);

  useEffect(
    () => () => {
      if (!modelUUID || !wsControllerURL) {
        return;
      }
      dispatch(jujuActions.clearSecrets({ modelUUID, wsControllerURL }));
    },
    [dispatch, modelUUID, wsControllerURL],
  );

  let content: ReactNode;
  if (secretsLoading || !secretsLoaded) {
    content = <LoadingSpinner />;
  } else if (secretsErrors) {
    content = (
      <Notification severity="negative" title="Error">
        {secretsErrors}
      </Notification>
    );
  } else {
    content = (
      <ul data-testid={TestId.SECRETS_TABLE}>
        {secrets?.map((secret) => (
          <li key={secret.uri}>{secret.label || secret.uri}</li>
        ))}
      </ul>
    );
  }

  return <div data-testid={TestId.SECRETS_TAB}>{content}</div>;
};

export default Secrets;
