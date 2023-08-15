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

import AuditLogsTablePagination from "../AuditLogsTablePagination";
import { DEFAULT_PAGE } from "../consts";
import { useFetchAuditEvents } from "../hooks";

export enum Label {
  FILTER = "Filter",
  REFRESH = "Refresh",
}

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
        className="u-no-margin--right"
        onClick={() =>
          setQueryParams({ panel: "audit-log-filters" }, { replace: true })
        }
      >
        <Icon name="filter" /> {Label.FILTER}
      </Button>
      <div className="action-bar__spacer"></div>
      <AuditLogsTablePagination showLimit />
    </>
  );
};

export default AuditLogsTableActions;
