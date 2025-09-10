import { Button, Chip, Icon, Tooltip } from "@canonical/react-components";
import type { ReactNode } from "react";

import ActionBar from "components/ActionBar/ActionBar";
import { useQueryParams } from "hooks/useQueryParams";
import type { SetParams } from "hooks/useQueryParams";

import { DEFAULT_AUDIT_LOG_FILTERS } from "./consts";

export type AuditLogFilters = {
  after: null | string;
  before: null | string;
  user: null | string;
  model: null | string;
  method: null | string;
};

const generateFilters = (
  filters: AuditLogFilters,
  setFilters: SetParams<AuditLogFilters>,
) =>
  // Reduce to remove filters that are not set.
  Object.entries(filters).reduce<ReactNode[]>((chips, [filter, value]) => {
    if (value !== null && value) {
      chips.push(
        <Chip
          className="u-no-margin--bottom"
          key={filter}
          lead={filter}
          value={value}
          onDismiss={() => setFilters({ [filter]: null })}
        />,
      );
    }
    return chips;
  }, []);

const AuditLogsTableFilters = () => {
  const [queryParams, setQueryParams] = useQueryParams<
    { page: null | string } & AuditLogFilters
  >({ ...DEFAULT_AUDIT_LOG_FILTERS, page: null });
  // Extract just the filters so that they can be looped over.
  const { page: _page, ...filters } = queryParams;
  const hasFilters = Object.values(filters).some((filter) => Boolean(filter));
  return hasFilters ? (
    <ActionBar>
      <Tooltip message="Clear all filters">
        <Button
          appearance="base"
          hasIcon
          onClick={() =>
            setQueryParams({ ...DEFAULT_AUDIT_LOG_FILTERS, page: null })
          }
          className="u-no-margin"
        >
          <Icon name="close">Clear</Icon>
        </Button>
      </Tooltip>{" "}
      <span>{generateFilters(filters, setQueryParams)}</span>
    </ActionBar>
  ) : null;
};

export default AuditLogsTableFilters;
