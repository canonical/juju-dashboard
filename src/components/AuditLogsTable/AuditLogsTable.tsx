import { ModularTable, Tooltip } from "@canonical/react-components";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { Column } from "react-table";

import LoadingSpinner from "components/LoadingSpinner/LoadingSpinner";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { formatFriendlyDateToNow } from "components/utils";
import { useQueryParams } from "hooks/useQueryParams";
import { actions as jujuActions } from "store/juju";
import {
  getAuditEvents,
  getAuditEventsLoading,
  getAuditEventsLoaded,
  getAuditEventsLimit,
} from "store/juju/selectors";
import { useAppDispatch } from "store/store";
import getUserName from "utils/getUserName";

import type { AuditLogFilters } from "./AuditLogsTableFilters/AuditLogsTableFilters";
import AuditLogsTableFilters from "./AuditLogsTableFilters/AuditLogsTableFilters";
import { DEFAULT_AUDIT_LOG_FILTERS } from "./AuditLogsTableFilters/AuditLogsTableFilters";
import AuditLogsTablePagination from "./AuditLogsTablePagination";
import { DEFAULT_PAGE } from "./consts";
import { useFetchAuditEvents } from "./hooks";

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

const AuditLogsTable = () => {
  const { modelName } = useParams<EntityDetailsRoute>();
  const showModel = !modelName;
  const dispatch = useAppDispatch();
  const auditLogs = useSelector(getAuditEvents);
  const auditLogsLoaded = useSelector(getAuditEventsLoaded);
  const auditLogsLoading = useSelector(getAuditEventsLoading);
  const auditLogsLimit = useSelector(getAuditEventsLimit);
  const [filters] = useQueryParams<AuditLogFilters>(DEFAULT_AUDIT_LOG_FILTERS);
  const hasFilters = Object.values(filters).some((filter) => !!filter);
  const additionalEmptyMsg = showModel ? "" : ` for ${modelName}`;
  const emptyMsg = hasFilters
    ? "No audit logs found. Try changing the filters."
    : `There are no audit logs available yet${additionalEmptyMsg}!`;
  const columnData = COLUMN_DATA.filter(
    (column) => showModel || column.accessor !== "model"
  );
  const fetchAuditEvents = useFetchAuditEvents();
  const [queryParams] = useQueryParams<{
    page: string;
  }>({
    page: DEFAULT_PAGE,
  });
  const page = Number(queryParams.page);
  const hasNextPage = (auditLogs?.length ?? 0) > auditLogsLimit;

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
    <>
      <AuditLogsTableFilters />
      {auditLogsLoading || !auditLogsLoaded ? (
        <LoadingSpinner />
      ) : (
        <ModularTable
          columns={columnData}
          // Table will display at most (limit) entries.
          data={hasNextPage ? tableData.slice(0, -1) : tableData}
          emptyMsg={emptyMsg}
        />
      )}
      {auditLogsLoaded && (hasNextPage || page > Number(DEFAULT_PAGE)) ? (
        <AuditLogsTablePagination />
      ) : null}
    </>
  );
};

export default AuditLogsTable;
