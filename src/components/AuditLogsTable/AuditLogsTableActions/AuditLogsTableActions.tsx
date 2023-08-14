import { Button, Icon, Tooltip } from "@canonical/react-components";

import { useQueryParams } from "hooks/useQueryParams";

import AuditLogsTablePagination from "../AuditLogsTablePagination";
import { DEFAULT_PAGE } from "../consts";
import { useFetchAuditEvents } from "../hooks";

import "./_audit-logs-table-actions.scss";

export enum Label {
  FILTER = "Filter",
  REFRESH = "Refresh",
}

const AuditLogsTableActions = () => {
  const [, setQueryParams] = useQueryParams<{
    limit: string | null;
    panel: string | null;
    page: string | null;
  }>({
    limit: null,
    panel: null,
    page: DEFAULT_PAGE,
  });
  const fetchAuditEvents = useFetchAuditEvents();
  return (
    <>
      <Tooltip message="Fetch latest logs">
        <Button
          hasIcon
          onClick={() => {
            setQueryParams({ page: null }, { replace: true });
            fetchAuditEvents();
          }}
        >
          <Icon name="restart">{Label.REFRESH}</Icon>
        </Button>
      </Tooltip>
      <Button
        onClick={() =>
          setQueryParams({ panel: "audit-log-filters" }, { replace: true })
        }
      >
        <Icon name="filter" /> {Label.FILTER}
      </Button>
      <AuditLogsTablePagination
        className="audit-logs-table-actions__pagination"
        showLimit
      />
    </>
  );
};

export default AuditLogsTableActions;
