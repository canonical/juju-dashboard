import { ModularTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Column } from "react-table";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { generateFakeAuditLogs } from "pages/Logs/audit-logs-fake-data";

const AuditLogsTable = () => {
  const { modelName } = useParams<EntityDetailsRoute>();

  const emptyMsg = `There are no audit logs available yet for ${modelName}`;
  const columnData: Column[] = useMemo(
    () => [
      {
        Header: "user tag",
        accessor: "userTag",
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
    ],
    []
  );
  const fakeTableData = useMemo(() => {
    const auditLogsData = generateFakeAuditLogs();
    const tableData = auditLogsData.map((auditLogsEntry) => {
      const { model } = auditLogsEntry;
      const time = new Date(auditLogsEntry.time).toLocaleString();
      const userTag = auditLogsEntry["user-tag"];
      const facadeName = auditLogsEntry["facade-name"];
      const facadeMethod = auditLogsEntry["facade-method"];
      const facadeVersion = auditLogsEntry["facade-version"];
      return { model, time, userTag, facadeName, facadeMethod, facadeVersion };
    });
    return tableData;
  }, []);

  return (
    <ModularTable
      columns={columnData}
      data={fakeTableData}
      emptyMsg={emptyMsg}
    />
  );
};

export default AuditLogsTable;
