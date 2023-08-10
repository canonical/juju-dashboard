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
  facade: string | null;
  method: string | null;
  version: string | null;
};

export const DEFAULT_AUDIT_LOG_FILTERS = {
  after: null,
  before: null,
  user: null,
  model: null,
  facade: null,
  method: null,
  version: null,
};

export const generateFilters = (
  filters: AuditLogFilters,
  setFilters: SetParams<AuditLogFilters>
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
        />
      );
    }
    return chips;
  }, []);

const AuditLogsTableFilters = () => {
  const [filters, setFilters] = useQueryParams<AuditLogFilters>({
    // Spread so that the default doesn't get updated when the filters change.
    ...DEFAULT_AUDIT_LOG_FILTERS,
  });
  const hasFilters = Object.values(filters).some((filter) => !!filter);
  return hasFilters ? (
    <ActionBar>
      <Tooltip message="Clear all filters">
        <Button
          appearance="base"
          hasIcon
          onClick={() => setFilters(DEFAULT_AUDIT_LOG_FILTERS)}
          className="u-no-margin"
        >
          <Icon name="close">Clear</Icon>
        </Button>
      </Tooltip>{" "}
      <span>{generateFilters(filters, setFilters)}</span>
    </ActionBar>
  ) : null;
};

export default AuditLogsTableFilters;
