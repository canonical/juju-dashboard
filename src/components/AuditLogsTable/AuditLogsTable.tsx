import { ModularTable, Tooltip } from "@canonical/react-components";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { Column } from "react-table";

import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { formatFriendlyDateToNow } from "components/utils";
import type { AuditEvent, AuditEvents } from "juju/jimm-facade";
import {
  getWSControllerURL,
  getControllerConnection,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppSelector, usePromiseDispatch } from "store/store";
import getUserName from "utils/getUserName";

type Props = {
  showModel?: boolean;
};

const COLUMN_DATA: Column[] = [
  {
    Header: "user",
    accessor: "user",
  },
  {
    Header: "model",
    accessor: "model",
  },
  {
    Header: "time",
    accessor: "time",
  },
  {
    Header: "facade name",
    accessor: "facadeName",
  },
  {
    Header: "facade method",
    accessor: "facadeMethod",
  },
  {
    Header: "facade version",
    accessor: "facadeVersion",
  },
];

const AuditLogsTable = ({ showModel = false }: Props) => {
  const { modelName } = useParams<EntityDetailsRoute>();
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const promiseDispatch = usePromiseDispatch();
  const wsControllerURL = useSelector(getWSControllerURL);
  const hasControllerConnection = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL)
  );
  const additionalEmptyMsg = showModel ? "" : ` for ${modelName}`;
  const emptyMsg = `There are no audit logs available yet${additionalEmptyMsg}!`;
  const columnData = COLUMN_DATA.filter(
    (column) => showModel || column.accessor !== "model"
  );

  useEffect(() => {
    if (!wsControllerURL || !hasControllerConnection) {
      return;
    }
    setLoading(true);
    promiseDispatch<AuditEvents>(
      jujuActions.findAuditEvents({ wsControllerURL })
    ).then((response) => {
      setLoading(false);
      setAuditLogs(response?.events);
    });
  }, [hasControllerConnection, promiseDispatch, wsControllerURL]);

  const tableData = useMemo(() => {
    if (!auditLogs) {
      return [];
    }
    const tableData = auditLogs.map((auditLogsEntry) => {
      const time = (
        <Tooltip
          message={new Date(auditLogsEntry.time).toLocaleString()}
          position="top-center"
        >
          {formatFriendlyDateToNow(auditLogsEntry.time)}
        </Tooltip>
      );
      const user = getUserName(auditLogsEntry["user-tag"]);
      const facadeName = auditLogsEntry["facade-name"];
      const facadeMethod = auditLogsEntry["facade-method"];
      const facadeVersion = auditLogsEntry["facade-version"];
      return {
        model: auditLogsEntry.model,
        time,
        user,
        facadeName,
        facadeMethod,
        facadeVersion,
      };
    });
    return tableData;
  }, [auditLogs]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ModularTable columns={columnData} data={tableData} emptyMsg={emptyMsg} />
  );
};

export default AuditLogsTable;
