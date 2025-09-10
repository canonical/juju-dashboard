import {
  Notification as ReactNotification,
  Button,
  Icon,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useCanManageSecrets from "hooks/useCanManageSecrets";
import { useQueryParams } from "hooks/useQueryParams";
import { useListSecrets } from "juju/api-hooks";
import { actions as jujuActions } from "store/juju";
import {
  getModelByUUID,
  getModelUUIDFromList,
  getSecretsErrors,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import SecretsTable from "./SecretsTable";
import { Label, TestId } from "./types";

const Secrets = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const dispatch = useAppDispatch();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const wsControllerURL =
    useAppSelector((state) => getModelByUUID(state, modelUUID))
      ?.wsControllerURL ?? null;
  const secretsErrors = useAppSelector((state) =>
    getSecretsErrors(state, modelUUID),
  );
  const canManageSecrets = useCanManageSecrets();

  const [, setQuery] = useQueryParams<{
    panel: null | string;
  }>({
    panel: null,
  });

  const listSecrets = useListSecrets(userName, modelName);

  useEffect(() => {
    listSecrets();
    return () => {
      if (!modelUUID || wsControllerURL === null || !wsControllerURL) {
        return;
      }
      dispatch(jujuActions.clearSecrets({ modelUUID, wsControllerURL }));
    };
  }, [dispatch, listSecrets, modelUUID, wsControllerURL]);

  let content: ReactNode;
  if (secretsErrors !== null && secretsErrors) {
    content = (
      <ReactNotification severity="negative" title="Error">
        {secretsErrors}
      </ReactNotification>
    );
  } else {
    content = (
      <>
        {canManageSecrets ? (
          <Button
            hasIcon
            onClick={() => setQuery({ panel: "add-secret" }, { replace: true })}
          >
            <Icon name="plus" />
            <span>{Label.ADD}</span>
          </Button>
        ) : null}
        <SecretsTable />
      </>
    );
  }

  return <div data-testid={TestId.SECRETS_TAB}>{content}</div>;
};

export default Secrets;
