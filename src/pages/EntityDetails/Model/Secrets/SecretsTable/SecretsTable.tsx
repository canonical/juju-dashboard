import { ModularTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Column } from "react-table";

import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import RelativeDate from "components/RelativeDate";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import {
  getSecretsLoading,
  getSecretsLoaded,
  getModelSecrets,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

export enum TestId {
  SECRETS_TABLE = "secrets-table",
}

const COLUMN_DATA: Column[] = [
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "ID",
    accessor: "id",
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
  },
];

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

  const tableData = useMemo(() => {
    if (!secrets) {
      return [];
    }
    return secrets.map((secret) => ({
      name: secret.label,
      id: secret.uri.replace(/^secret:/, ""),
      revision: secret.revisions[0]?.revision,
      description: secret.description,
      owner: secret["owner-tag"]?.startsWith("model-")
        ? "Model"
        : secret["owner-tag"],
      created: <RelativeDate datetime={secret["create-time"]} />,
      updated: <RelativeDate datetime={secret["update-time"]} />,
      actions: "",
    }));
  }, [secrets]);

  return (
    <>
      {secretsLoading || !secretsLoaded ? (
        <LoadingSpinner />
      ) : (
        <ModularTable
          data-testid={TestId.SECRETS_TABLE}
          className="audit-logs-table"
          columns={COLUMN_DATA}
          data={tableData}
          emptyMsg="There are no secrets for this model."
        />
      )}
    </>
  );
};

export default SecretsTable;
