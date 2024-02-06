import { Notification, Button, Icon } from "@canonical/react-components";
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

  const listSecrets = useListSecrets(userName, modelName);

  useEffect(() => {
    listSecrets();
    return () => {
      if (!modelUUID || !wsControllerURL) {
        return;
      }
      dispatch(jujuActions.clearSecrets({ modelUUID, wsControllerURL }));
    };
  }, [dispatch, listSecrets, modelUUID, wsControllerURL]);

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
          hasIcon
          onClick={() => setQuery({ panel: "add-secret" }, { replace: true })}
        >
          <Icon name="plus" />
          <span>{Label.ADD}</span>
        </Button>
        <SecretsTable />
      </>
    );
  }

  return <div data-testid={TestId.SECRETS_TAB}>{content}</div>;
};

export default Secrets;
