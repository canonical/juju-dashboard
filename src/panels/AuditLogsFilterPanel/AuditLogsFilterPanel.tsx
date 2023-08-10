import { Button } from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId } from "react";

import {
  DEFAULT_AUDIT_LOG_FILTERS,
  type AuditLogFilters,
} from "components/AuditLogsTable/AuditLogsTableFilters/AuditLogsTableFilters";
import Panel from "components/Panel";
import { useQueryParams } from "hooks/useQueryParams";
import { usePanelQueryParams } from "panels/hooks";

import Fields from "./Fields";
import type { FormFields } from "./types";

export enum Label {
  CLEAR = "Clear",
  FILTER = "Filter",
}

export enum TestId {
  PANEL = "audit-logs-filter-panel",
}

const AuditLogsFilterPanel = (): JSX.Element => {
  const formId = useId();
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: string | null;
  }>({
    panel: null,
  });
  // These params are handled separately from the values in usePanelQueryParams
  // as they shouldn't be cleared when the panel closes.
  const [queryParams, setQueryParams] = useQueryParams<
    AuditLogFilters & { panel: string | null }
  >({
    ...DEFAULT_AUDIT_LOG_FILTERS,
    panel: null,
  });
  return (
    <>
      <Panel
        data-testid={TestId.PANEL}
        drawer={
          <>
            <Button
              onClick={() => {
                setQueryParams({
                  ...DEFAULT_AUDIT_LOG_FILTERS,
                  panel: undefined,
                });
              }}
              type="button"
            >
              {Label.CLEAR}
            </Button>
            <Button appearance="positive" type="submit" form={formId}>
              {Label.FILTER}
            </Button>
          </>
        }
        onRemovePanelQueryParams={handleRemovePanelQueryParams}
        title="Filter audit logs"
        width="narrow"
      >
        <Formik<FormFields>
          initialValues={{
            // Restore the values from the query string.
            after: queryParams.after ?? "",
            before: queryParams.before ?? "",
            user: queryParams.user ?? "",
            model: queryParams.model ?? "",
            facade: queryParams.facade ?? "",
            method: queryParams.method ?? "",
            version: queryParams.version ?? "",
          }}
          onSubmit={(values) => {
            // Set the filters and close the panel.
            setQueryParams({ ...values, panel: undefined });
          }}
        >
          <Form id={formId}>
            <Fields />
          </Form>
        </Formik>
      </Panel>
    </>
  );
};

export default AuditLogsFilterPanel;
