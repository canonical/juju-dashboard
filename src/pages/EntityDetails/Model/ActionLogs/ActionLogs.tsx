import ModularTable from "@canonical/react-components/dist/components/ModularTable/ModularTable";
import { useMemo } from "react";

export default function ActionLogs() {
  return (
    <ModularTable
      columns={useMemo(
        () => [
          {
            Header: "application",
            accessor: "application",
          },
          {
            Header: "operation id/name",
            accessor: "id",
          },
          {
            Header: "status",
            accessor: "status",
          },
          {
            Header: "task id",
            accessor: "taskId",
          },
          {
            Header: "action message",
            accessor: "message",
          },
          {
            Header: "completion time",
            accessor: "completed",
          },
        ],
        []
      )}
      data={useMemo(
        () => [
          {
            application: "glance",
            id: "19/openstack-upgrade",
            status: "running",
            taskId: "21",
            message: "openstack-upgrade",
            completed: "2020-12-30 11:02:55",
          },
        ],
        []
      )}
    />
  );
}
