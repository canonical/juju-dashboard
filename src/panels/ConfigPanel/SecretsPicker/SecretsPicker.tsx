import type { ContextualMenuProps } from "@canonical/react-components";
import {
  ContextualMenu,
  Icon,
  Spinner,
  Tooltip,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useListSecrets } from "juju/apiHooks";
import { actions as jujuActions } from "store/juju";
import {
  getModelByUUID,
  getModelUUIDFromList,
  getSecretsErrors,
  getSecretsLoading,
  getModelSecrets,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

export enum Label {
  CHOOSE_SECRET = "Choose a secret",
  LOADING = "Loading",
}

type Props = {
  setValue: (secret: string) => void;
};

export default function SecretsPicker({ setValue }: Props): JSX.Element {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const dispatch = useAppDispatch();
  const modelUUID = useAppSelector(getModelUUIDFromList(modelName, userName));
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const secretsErrors = useAppSelector((state) =>
    getSecretsErrors(state, modelUUID),
  );
  const listSecrets = useListSecrets(userName, modelName);
  const secretsLoading = useAppSelector((state) =>
    getSecretsLoading(state, modelUUID),
  );
  const secrets = useAppSelector((state) => getModelSecrets(state, modelUUID));

  useEffect(() => {
    listSecrets();
    return () => {
      if (!modelUUID || !wsControllerURL) {
        return;
      }
      dispatch(jujuActions.clearSecrets({ modelUUID, wsControllerURL }));
    };
  }, [dispatch, listSecrets, modelUUID, wsControllerURL]);

  let links: ContextualMenuProps<unknown>["links"] = null;
  let dropdownContent: ReactNode = null;
  if (secretsLoading) {
    dropdownContent = (
      <div className="u-align--center">
        <Spinner aria-label={Label.LOADING} />
      </div>
    );
  } else if (secretsErrors) {
    dropdownContent = secretsErrors;
  } else {
    links = secrets?.map((secret) => {
      const id = secret.uri.replace(/^secret:/, "");
      return {
        children: (
          <>
            {secret.label ? (
              <>
                {secret.label} <span className="u-text--muted">({id})</span>
              </>
            ) : (
              id
            )}
          </>
        ),
        onClick: () => setValue(secret.uri),
      };
    });
  }

  return (
    <ContextualMenu
      dropdownClassName="p-contextual-menu__dropdown--over-panel prevent-panel-close"
      links={links ?? []}
      position="right"
      scrollOverflow
      toggleAppearance="base"
      toggleClassName="has-icon u-no-margin--bottom is-small config-input__pick-secret"
      toggleLabel={
        <Tooltip message={Label.CHOOSE_SECRET}>
          <Icon name="security">{Label.CHOOSE_SECRET}</Icon>
        </Tooltip>
      }
    >
      {dropdownContent}
    </ContextualMenu>
  );
}
