import type { JSX } from "react";

import ActionBar from "components/ActionBar";
import AuditLogsTable from "components/AuditLogsTable/AuditLogsTable";
import AuditLogsTableActions from "components/AuditLogsTable/AuditLogsTableActions";
import CheckPermissions from "components/CheckPermissions";
import { useAuditLogsPermitted } from "juju/api-hooks/permissions";
import MainContent from "layout/MainContent";
import { testId } from "testing/utils";

import { Label, TestId } from "./types";

const Logs = (): JSX.Element => {
  const { loading, permitted } = useAuditLogsPermitted();
  return (
    <CheckPermissions
      allowed={permitted}
      {...testId(TestId.COMPONENT)}
      loading={loading}
    >
      <MainContent {...testId(TestId.COMPONENT)} title={Label.TITLE}>
        <ActionBar>
          <AuditLogsTableActions />
        </ActionBar>
        <AuditLogsTable />
      </MainContent>
    </CheckPermissions>
  );
};

export default Logs;
