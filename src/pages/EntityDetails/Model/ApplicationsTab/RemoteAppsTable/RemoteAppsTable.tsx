import { MainTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useModelStatus from "hooks/useModelStatus";
import { remoteApplicationTableHeaders } from "tables/tableHeaders";
import { generateRemoteApplicationRows } from "tables/tableRows";

import { Label } from "./types";

const RemoteAppsTable = () => {
  const { userName = null, modelName = null } = useParams<EntityDetailsRoute>();
  const modelStatusData = useModelStatus();
  const remoteApplicationTableRows = useMemo(() => {
    return modelName !== null && modelName && userName !== null && userName
      ? generateRemoteApplicationRows(modelStatusData)
      : [];
  }, [modelStatusData, modelName, userName]);

  return (
    <MainTable
      headers={remoteApplicationTableHeaders}
      rows={remoteApplicationTableRows}
      className="entity-details__remote-apps p-main-table"
      sortable
      emptyStateMsg={Label.NO_REMOTE_APPS}
    />
  );
};

export default RemoteAppsTable;
