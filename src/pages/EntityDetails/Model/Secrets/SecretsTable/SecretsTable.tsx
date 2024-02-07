import {
  ModularTable,
  Button,
  Icon,
  Tooltip,
  ContextualMenu,
} from "@canonical/react-components";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Column } from "react-table";

import AppLink from "components/AppLink";
import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import RelativeDate from "components/RelativeDate";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import TruncatedTooltip from "components/TruncatedTooltip";
import { copyToClipboard } from "components/utils";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getSecretsLoading,
  getSecretsLoaded,
  getModelSecrets,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

import SecretContent from "../SecretContent";

export enum Label {
  ACTION_MENU = "Action menu",
  COPY = "Copy",
  REMOVE_BUTTON = "Remove secret",
}

export enum TestId {
  SECRETS_TABLE = "secrets-table",
}

const SecretsTable = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector(getModelUUIDFromList(modelName, userName));
  const secrets = useAppSelector((state) => getModelSecrets(state, modelUUID));
  const secretsLoaded = useAppSelector((state) =>
    getSecretsLoaded(state, modelUUID),
  );
  const secretsLoading = useAppSelector((state) =>
    getSecretsLoading(state, modelUUID),
  );
  const [, setQuery] = useQueryParams<{
    panel: string | null;
    secret: string | null;
  }>({
    panel: null,
    secret: null,
  });

  const tableData = useMemo(() => {
    if (!secrets) {
      return [];
    }
    return secrets.map((secret) => {
      const id = secret.uri.replace(/^secret:/, "");
      let owner: ReactNode = secret["owner-tag"];
      if (secret["owner-tag"]?.startsWith("model-")) {
        owner = "Model";
      } else if (secret["owner-tag"]?.startsWith("application-")) {
        const name = secret["owner-tag"].replace(/^application-/, "");
        owner = (
          <AppLink uuid={modelUUID} appName={name}>
            {name}
          </AppLink>
        );
      }
      return {
        name: (
          <>
            <SecretContent secretURI={secret.uri} /> {secret.label}
          </>
        ),
        id: (
          <div className="u-flex u-flex--gap-small">
            <TruncatedTooltip
              wrapperClassName="u-flex-shrink u-truncate"
              message={id}
            >
              {id}
            </TruncatedTooltip>
            <div className="has-hover__hover-state">
              <Tooltip message="Copy secret URI">
                <Button
                  appearance="base"
                  className="is-small"
                  onClick={() => {
                    copyToClipboard(secret.uri);
                  }}
                  type="button"
                  hasIcon
                >
                  <Icon name="copy">{Label.COPY}</Icon>
                </Button>
              </Tooltip>
            </div>
          </div>
        ),
        revision: secret["latest-revision"],
        description: secret.description,
        owner,
        created: <RelativeDate datetime={secret["create-time"]} />,
        updated: <RelativeDate datetime={secret["update-time"]} />,
        actions: (
          <ContextualMenu
            links={[
              {
                children: Label.REMOVE_BUTTON,
                onClick: () =>
                  setQuery({ panel: "remove-secret", secret: secret.uri }),
              },
            ]}
            position="right"
            scrollOverflow
            toggleAppearance="base"
            toggleClassName="has-icon u-no-margin--bottom is-small"
            toggleLabel={<Icon name="menu">{Label.ACTION_MENU}</Icon>}
          />
        ),
      };
    });
  }, [modelUUID, secrets, setQuery]);

  const columnData: Column[] = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "ID",
        accessor: "id",
        className: "has-hover",
      },
      {
        Header: "Revision",
        accessor: "revision",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Owner",
        accessor: "owner",
      },
      {
        Header: "Created",
        accessor: "created",
      },
      {
        Header: "Updated",
        accessor: "updated",
      },
      {
        Header: "Actions",
        accessor: "actions",
        className: "u-align--right",
      },
    ],
    [],
  );

  return (
    <>
      {secretsLoading || !secretsLoaded ? (
        <LoadingSpinner />
      ) : (
        <ModularTable
          data-testid={TestId.SECRETS_TABLE}
          className="audit-logs-table"
          columns={columnData}
          data={tableData}
          emptyMsg="There are no secrets for this model."
        />
      )}
    </>
  );
};

export default SecretsTable;
