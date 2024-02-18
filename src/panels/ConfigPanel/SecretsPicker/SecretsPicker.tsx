import type {
  ButtonProps,
  ContextualMenuProps,
  MenuLink,
} from "@canonical/react-components";
import {
  ContextualMenu,
  Icon,
  Spinner,
  Tooltip,
  Modal,
  ActionButton,
  Button,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { useParams } from "react-router-dom";
import usePortal from "react-useportal";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import SecretForm from "components/secrets/SecretForm";
import useCanManageSecrets from "hooks/useCanManageSecrets";
import { useListSecrets } from "juju/apiHooks";
import { actions as jujuActions } from "store/juju";
import {
  getModelByUUID,
  getModelUUIDFromList,
  getSecretsErrors,
  getSecretsLoading,
  getModelSecrets,
  getSecretsLoaded,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

export enum Label {
  BUTTON_ADD = "Add a secret...",
  BUTTON_CANCEL = "Cancel",
  BUTTON_SUBMIT = "Add secret",
  CHOOSE_SECRET = "Choose a secret",
  LOADING = "Loading",
  MODAL_TITLE = "Add secret",
  NONE = "No secrets",
}

type Props = {
  setValue: (secret: string) => void;
};

export default function SecretsPicker({ setValue }: Props): JSX.Element {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState<boolean>(false);
  const formId = useId();
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
  const secretsLoaded = useAppSelector((state) =>
    getSecretsLoaded(state, modelUUID),
  );
  const secrets = useAppSelector((state) => getModelSecrets(state, modelUUID));
  const canManageSecrets = useCanManageSecrets();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  useEffect(
    () => () => {
      if (!modelUUID || !wsControllerURL) {
        return;
      }
      dispatch(jujuActions.clearSecrets({ modelUUID, wsControllerURL }));
    },
    [dispatch, modelUUID, wsControllerURL],
  );

  let links: ContextualMenuProps<unknown>["links"] = null;
  let dropdownContent: ReactNode = null;
  if (secretsLoading && !secretsLoaded) {
    dropdownContent = (
      <div className="u-align--center">
        <Spinner aria-label={Label.LOADING} />
      </div>
    );
  } else if (secretsErrors) {
    dropdownContent = secretsErrors;
  } else if (!canManageSecrets && !secrets?.length) {
    dropdownContent = Label.NONE;
  } else {
    const secretLinks: MenuLink<ButtonProps> | undefined =
      secrets?.map<ButtonProps>((secret) => {
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
    if (canManageSecrets) {
      const addButton: MenuLink<ButtonProps> = {
        children: Label.BUTTON_ADD,
        onClick: openPortal,
      };
      if (secretLinks?.length) {
        links = [[addButton], secretLinks];
      } else {
        links = [addButton];
      }
    } else {
      links = secretLinks ?? [];
    }
  }

  return (
    <>
      <ContextualMenu
        dropdownClassName="p-contextual-menu__dropdown--over-panel prevent-panel-close"
        links={links ?? []}
        onToggleMenu={(open) => {
          open && listSecrets();
        }}
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
      {isOpen ? (
        <Portal>
          <Modal
            className="p-modal--min-width prevent-panel-close"
            close={() => {
              closePortal();
            }}
            title={Label.MODAL_TITLE}
          >
            <SecretForm
              formId={formId}
              onSuccess={(secretURI) => {
                setSaving(false);
                secretURI && setValue(secretURI);
                closePortal();
              }}
              setSaving={setSaving}
            />
            <div>
              <Button onClick={closePortal}>{Label.BUTTON_CANCEL}</Button>
              <ActionButton
                appearance="positive"
                disabled={saving}
                form={formId}
                loading={saving}
                type="submit"
              >
                {Label.BUTTON_SUBMIT}
              </ActionButton>
            </div>
          </Modal>
        </Portal>
      ) : null}
    </>
  );
}
