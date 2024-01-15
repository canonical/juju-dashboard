import { Button, Chip, Icon, Tooltip } from "@canonical/react-components";
import { type ReactNode } from "react";

import ActionBar from "components/ActionBar/ActionBar";
import { useQueryParams } from "hooks/useQueryParams";
import type { SetParams } from "hooks/useQueryParams";

export type AuditLogFilters = {
  after: string | null;
  before: string | null;
  user: string | null;
  model: string | null;
  method: string | null;
};

export const DEFAULT_AUDIT_LOG_FILTERS = {
  after: null,
  before: null,
  user: null,
  model: null,
  method: null,
};

export const generateFilters = (
  filters: AuditLogFilters,
  setFilters: SetParams<AuditLogFilters>,
) =>
  // Reduce to remove filters that are not set.
  Object.entries(filters).reduce<ReactNode[]>((chips, [filter, value]) => {
    if (value) {
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
    AuditLogFilters & { page: string | null }
  >({ ...DEFAULT_AUDIT_LOG_FILTERS, page: null });
  // Extract just the filters so that they can be looped over.
  const { page, ...filters } = queryParams;
  const hasFilters = Object.values(filters).some((filter) => !!filter);
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
