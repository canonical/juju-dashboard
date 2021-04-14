import { useEffect, useMemo, useState } from "react";
import { DefaultRootState, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";

import ModularTable from "@canonical/react-components/dist/components/ModularTable/ModularTable";

import { getModelUUID, getModelStatus } from "app/selectors";
import { queryOperationsList } from "juju/index";

import type { EntityDetailsRoute } from "components/Routes/Routes";

type ApplicationList = { [key: string]: any };

export default function ActionLogs() {
  const [operations, setOperations] = useState([]);
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
    // Group the operation data by application
    return [
      {
        application: "glance",
        id: "19/openstack-upgrade",
        status: "running",
        taskId: "21",
        message: "openstack-upgrade",
        completed: "2020-12-30 11:02:55",
      },
    ];
    console.log(operations);
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
