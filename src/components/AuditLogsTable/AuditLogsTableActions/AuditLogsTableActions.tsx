import {
  Button,
  Icon,
  Tooltip,
  Pagination,
  Select,
} from "@canonical/react-components";
import { useCallback, type OptionHTMLAttributes } from "react";
import { useSelector } from "react-redux";

import { useQueryParams } from "hooks/useQueryParams";
import { actions as jujuActions } from "store/juju";
import { getAuditEvents, getAuditEventsLimit } from "store/juju/selectors";
import { useAppDispatch } from "store/store";

import { DEFAULT_LIMIT_VALUE, DEFAULT_PAGE } from "../consts";
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
  const dispatch = useAppDispatch();
  const auditLogs = useSelector(getAuditEvents);
  const [queryParams, setQueryParams] = useQueryParams<{
    panel: string | null;
    page: string | null;
  }>({
    panel: null,
    page: DEFAULT_PAGE,
  });
  const limit = useSelector(getAuditEventsLimit);
  const page = Number(queryParams.page);
  const fetchAuditEvents = useFetchAuditEvents();

  const handleChangeSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setQueryParams({ page: null }, { replace: true });
      dispatch(jujuActions.updateAuditEventsLimit(Number(e.target.value)));
    },
    [dispatch, setQueryParams]
  );

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
      <div className="audit-logs-table-actions__pagination">
        <Select
          defaultValue={limit}
          options={LIMIT_OPTIONS}
          onChange={handleChangeSelect}
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
