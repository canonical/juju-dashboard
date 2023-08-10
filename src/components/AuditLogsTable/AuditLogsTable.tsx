import {
  Button,
  ModularTable,
  Pagination,
  Select,
  Tooltip,
} from "@canonical/react-components";
import {
  type OptionHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

import "./_audit-logs-table.scss";

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

export const DEFAULT_LIMIT_VALUE = 50;
const LIMIT_OPTIONS: OptionHTMLAttributes<HTMLOptionElement>[] = [
  { label: "50/page", value: DEFAULT_LIMIT_VALUE },
  { label: "100/page", value: 100 },
  { label: "200/page", value: 200 },
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

  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT_VALUE);
  const [queryParams, setQueryParams] = useQueryParams<{ page: string }>({
    page: "1",
  });
  const page = Number(queryParams.page);

  const fetchAuditEvents = useCallback(
    (limit: number) => {
      if (!wsControllerURL || !hasControllerConnection) {
        return;
      }
      dispatch(
        jujuActions.fetchAuditEvents({
          wsControllerURL,
          // Fetch an extra entry in order to check if there are more pages.
          limit: limit + 1,
          offset: (page - 1) * limit,
        })
      );
    },
    [dispatch, hasControllerConnection, page, wsControllerURL]
  );

  useEffect(() => {
    fetchAuditEvents(limit);
  }, [fetchAuditEvents, limit]);

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
      <div className="audit-logs__filter">
        <Button
          onClick={() => {
            setQueryParams({ page: "1" });
            fetchAuditEvents(limit);
          }}
        >
          Refresh
        </Button>
        <div className="audit-logs__pagination">
          <Pagination
            onForward={() => {
              setQueryParams({ page: (page + 1).toString() });
            }}
            onBack={() => {
              setQueryParams({ page: (page - 1).toString() });
            }}
            // No further pages if couldn't fetch (limit + 1) entries.
            forwardDisabled={tableData.length <= limit}
            backDisabled={page === 1}
            centered
          />
          <Select
            defaultValue={DEFAULT_LIMIT_VALUE}
            options={LIMIT_OPTIONS}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setQueryParams({ page: "1" });
              setLimit(parseInt(e.target.value));
            }}
          />
        </div>
      </div>
      {auditLogsLoading || !auditLogsLoaded ? (
        <LoadingSpinner />
      ) : (
        <ModularTable
          columns={columnData}
          // Table will display at most (limit) entries.
          data={tableData.length <= limit ? tableData : tableData.slice(0, -1)}
          emptyMsg={emptyMsg}
        />
      )}
    </div>
  );
};

export default AuditLogsTable;
