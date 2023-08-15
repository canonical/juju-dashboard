import type { PropsWithSpread } from "@canonical/react-components";
import { Button, Icon, Pagination, Select } from "@canonical/react-components";
import classNames from "classnames";
import type { HTMLProps, OptionHTMLAttributes } from "react";
import { useSelector } from "react-redux";

import { useQueryParams } from "hooks/useQueryParams";
import { getAuditEvents } from "store/juju/selectors";

import { DEFAULT_LIMIT_VALUE, DEFAULT_PAGE } from "../consts";

import "./_audit-logs-table-pagination.scss";

export enum Label {
  FIRST_PAGE = "Back to first page",
}

type Props = PropsWithSpread<
  {
    showLimit?: boolean;
  },
  HTMLProps<HTMLDivElement>
>;

const LIMIT_OPTIONS: OptionHTMLAttributes<HTMLOptionElement>[] = [
  { label: "50/page", value: DEFAULT_LIMIT_VALUE },
  { label: "100/page", value: 100 },
  { label: "200/page", value: 200 },
];

const scrollToTop = () => {
  document?.querySelector<HTMLDivElement>(".l-application")?.scrollTo(0, 0);
};

const AuditLogsTablePagination = ({
  className,
  showLimit,
  ...props
}: Props) => {
  const auditLogs = useSelector(getAuditEvents);
  const [queryParams, setQueryParams] = useQueryParams<{
    limit: string | null;
    panel: string | null;
    page: string | null;
  }>({
    limit: null,
    panel: null,
    page: DEFAULT_PAGE,
  });
  const limit = Number(queryParams.limit);
  const page = Number(queryParams.page);
  return (
    <div
      className={classNames("audit-logs-table-pagination", className)}
      {...props}
    >
      {showLimit ? (
        <Select
          defaultValue={DEFAULT_LIMIT_VALUE}
          options={LIMIT_OPTIONS}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setQueryParams(
              { limit: e.target.value, page: null },
              { replace: true }
            );
          }}
        />
      ) : null}
      <Button
        className="u-no-margin--right"
        disabled={page === Number(DEFAULT_PAGE)}
        hasIcon
        onClick={() => {
          setQueryParams({ page: null });
          scrollToTop();
        }}
      >
        <Icon className="p-icon--rotate-270" name="back-to-top">
          {Label.FIRST_PAGE}
        </Icon>
      </Button>
      <Pagination
        onForward={() => {
          setQueryParams({ page: (page + 1).toString() });
          scrollToTop();
        }}
        onBack={() => {
          setQueryParams({ page: (page - 1).toString() });
          scrollToTop();
        }}
        // No further pages if couldn't fetch (limit + 1) entries.
        forwardDisabled={(auditLogs?.length ?? 0) <= limit}
        backDisabled={page === 1}
      />
    </div>
  );
};

export default AuditLogsTablePagination;
