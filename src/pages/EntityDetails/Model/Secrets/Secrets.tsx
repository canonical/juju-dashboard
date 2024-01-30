import { Notification, Button } from "@canonical/react-components";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import { useListSecrets } from "juju/apiHooks";
import { actions as jujuActions } from "store/juju";
import {
  getModelByUUID,
  getModelUUIDFromList,
  getSecretsErrors,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import SecretsTable from "./SecretsTable";

export enum Label {
  ADD = "Add secret",
}

export enum TestId {
  SECRETS_TAB = "secrets-tab",
}

const Secrets = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const dispatch = useAppDispatch();
  const modelUUID = useAppSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const secretsErrors = useAppSelector((state) =>
    getSecretsErrors(state, modelUUID),
  );

  const [, setQuery] = useQueryParams<{
    panel: string | null;
  }>({
    panel: null,
  });

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
  if (secretsErrors) {
    content = (
      <Notification severity="negative" title="Error">
        {secretsErrors}
      </Notification>
    );
  } else {
    content = (
      <>
        <Button
          onClick={() => setQuery({ panel: "add-secret" }, { replace: true })}
        >
          {Label.ADD}
        </Button>
        <SecretsTable />
      </>
    );
  }

  return <div data-testid={TestId.SECRETS_TAB}>{content}</div>;
};

export default Secrets;
