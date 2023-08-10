import {
  Button,
  Icon,
  Tooltip,
  Pagination,
  Select,
} from "@canonical/react-components";
import type { OptionHTMLAttributes } from "react";
import { useSelector } from "react-redux";

import { useQueryParams } from "hooks/useQueryParams";
import { getAuditEvents } from "store/juju/selectors";

import { DEFAULT_LIMIT_VALUE } from "../consts";
import { useFetchAuditEvents } from "../hooks";

import "./_audit-logs-table-actions.scss";

export enum Label {
  FILTER = "Filter",
  REFRESH = "Refresh",
}

const LIMIT_OPTIONS: OptionHTMLAttributes<HTMLOptionElement>[] = [
  { label: "50/page", value: DEFAULT_LIMIT_VALUE },
  { label: "100/page", value: 100 },
  { label: "200/page", value: 200 },
];

const AuditLogsTableActions = () => {
  const auditLogs = useSelector(getAuditEvents);
  const [queryParams, setQueryParams] = useQueryParams<{
    limit: string | null;
    panel: string | null;
    page: string | null;
  }>({
    limit: null,
    panel: null,
    page: "1",
  });
  const limit = Number(queryParams.limit);
  const page = Number(queryParams.page);
  const fetchAuditEvents = useFetchAuditEvents();
  return (
    <>
      <Tooltip message="Fetch latest logs">
        <Button
          hasIcon
          onClick={() => {
            setQueryParams({ page: "1" }, { replace: true });
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
      <div className="audit-logs-table-actions__pagination">
        <Select
          defaultValue={DEFAULT_LIMIT_VALUE}
          options={LIMIT_OPTIONS}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setQueryParams(
              { limit: e.target.value, page: "1" },
              { replace: true }
            );
          }}
        />
        <Pagination
          onForward={() => {
            setQueryParams({ page: (page + 1).toString() });
          }}
          onBack={() => {
            setQueryParams({ page: (page - 1).toString() });
          }}
          // No further pages if couldn't fetch (limit + 1) entries.
          forwardDisabled={(auditLogs?.length ?? 0) <= limit}
          backDisabled={page === 1}
          centered
        />
      </div>
    </>
  );
};

export default AuditLogsTableActions;
