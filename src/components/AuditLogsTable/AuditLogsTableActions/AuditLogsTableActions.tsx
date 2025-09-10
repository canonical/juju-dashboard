import { Button, Icon, Tooltip } from "@canonical/react-components";
import type { FC } from "react";

import { useQueryParams } from "hooks/useQueryParams";

import AuditLogsTablePagination from "../AuditLogsTablePagination";
import { DEFAULT_PAGE } from "../consts";
import { useFetchAuditEvents } from "../hooks";

import { Label } from "./types";

const AuditLogsTableActions: FC = () => {
  const [, setQueryParams] = useQueryParams<{
    panel: null | string;
    page: null | string;
  }>({
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
