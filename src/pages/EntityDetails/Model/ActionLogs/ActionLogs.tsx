import { useEffect, useMemo, useState } from "react";
import { DefaultRootState, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";

import ModularTable from "@canonical/react-components/dist/components/ModularTable/ModularTable";

import { getModelUUID, getModelStatus } from "app/selectors";
import { queryOperationsList } from "juju/index";

import type { EntityDetailsRoute } from "components/Routes/Routes";

type ApplicationList = { [key: string]: any };

type Operations = Operation[];

type Operation = {
  operation: string;
  actions: Action[];
};

type TableRows = TableRow[];

type TableRow = {
  application: string;
  id: string;
  status: string;
  taskId: string;
  message: string;
  completed: string;
};

// https://github.com/juju/js-libjuju/blob/master/api/facades/action-v6.ts#L27
type Action = {
  action: ActionData;
  enqueued: string;
  started: string;
  completed: string;
  status: string;
  message: string;
};

type ActionData = {
  tag: string;
  receiver: string;
  name: string;
};

export default function ActionLogs() {
  const [operations, setOperations] = useState<Operations>([]);
  const { modelName } = useParams<EntityDetailsRoute>();
  const appStore = useStore();
  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  // Selectors.js is not typescript yet and it complains about the return value
  // of getModelUUID. TSFixMe
  const modelUUID = useSelector(
    getModelUUIDMemo as (state: DefaultRootState) => string
  );
  const modelStatusData = useSelector(
    getModelStatus(modelUUID) as (
      state: DefaultRootState
    ) => { applications: ApplicationList }
  );

  const applicationList = () => Object.keys(modelStatusData.applications);

  useEffect(() => {
    async function fetchData() {
      const operationList = await queryOperationsList(
        {
          applications: applicationList,
        },
        modelUUID,
        appStore.getState()
      );
      setOperations(operationList.results);
    }
    fetchData();
    // XXX Temporarily disabled.
    // Used to stop it re-requesting every time state changes.
    // appStore and applicationList removed from dependency graph
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUUID]);

  const tableData = useMemo(() => {
    const rows: TableRows = [];
    operations.forEach((operationData) => {
      const operationId = operationData.operation.split("-")[1];
      // The action name is being defined like this because the action name is
      // only contained in the actions array and not on the operation level.
      // Even though at the current time an operation is the same action
      // performed across multiple units of the same application. I expect
      // that the CLI may gain this functionality in the future and we'll have
      // to update this code to display the correct action name.
      let actionName = "";
      operationData.actions.forEach((actionData, index) => {
        actionName = actionData.action.name;
        let defaultRow: TableRow = {
          application: "-",
          id: "-",
          status: "-",
          taskId: "",
          message: "",
          completed: "",
        };
        let newData = {};
        if (index === 0) {
          // If this is the first row then add the application row.
          newData = {
            application: actionData.action.receiver.split("-")[1],
            id: `${operationId}/${actionName}`,
            status: actionData.status,
          };
          rows.push({
            ...defaultRow,
            ...newData,
          });
        }
        newData = {
          application: actionData.action.receiver
            .replace("unit-", "")
            .split("-")
            .join("/"),
          id: "",
          status: actionData.status,
          taskId: actionData.action.tag.split("-")[1],
          message: actionData.message,
          completed: actionData.completed,
        };

        rows.push({
          ...defaultRow,
          ...newData,
        });
      });
    });
    return rows;
  }, [operations]);

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
      data={tableData}
    />
  );
}
