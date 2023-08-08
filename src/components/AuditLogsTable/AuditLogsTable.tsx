import { Button, ModularTable, Tooltip } from "@canonical/react-components";
import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { Column } from "react-table";

import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { formatFriendlyDateToNow } from "components/utils";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getWSControllerURL,
  getControllerConnection,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getAuditEvents,
  getAuditEventsLoading,
  getAuditEventsLoaded,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";
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
  const dispatch = useAppDispatch();
  const wsControllerURL = useSelector(getWSControllerURL);
  const auditLogs = useSelector(getAuditEvents);
  const auditLogsLoaded = useSelector(getAuditEventsLoaded);
  const auditLogsLoading = useSelector(getAuditEventsLoading);
  const hasControllerConnection = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL)
  );
  const additionalEmptyMsg = showModel ? "" : ` for ${modelName}`;
  const emptyMsg = `There are no audit logs available yet${additionalEmptyMsg}!`;
  const columnData = COLUMN_DATA.filter(
    (column) => showModel || column.accessor !== "model"
  );

  const [, setQueryParams] = useQueryParams<{ page: string | null }>({
    page: null,
  });

  const fetchAuditEvents = useCallback(() => {
    if (!wsControllerURL || !hasControllerConnection) {
      return;
    }
    dispatch(jujuActions.fetchAuditEvents({ wsControllerURL }));
  }, [dispatch, hasControllerConnection, wsControllerURL]);

  useEffect(() => {
    fetchAuditEvents();
  }, [fetchAuditEvents]);

  useEffect(
    () => () => {
      // Clear audit events when the component is unmounted.
      dispatch(jujuActions.clearAuditEvents());
    },
    [dispatch]
  );

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

  return (
    <div className="audit-logs__table">
      <Button
        onClick={() => {
          fetchAuditEvents();
          setQueryParams({ page: "1" });
        }}
      >
        Refresh
      </Button>
      {auditLogsLoading || !auditLogsLoaded ? (
        <LoadingSpinner />
      ) : (
        <ModularTable
          columns={columnData}
          data={tableData}
          emptyMsg={emptyMsg}
        />
      )}
    </div>
  );
};

export default AuditLogsTable;
