import type { JSX } from "react";

import ActionBar from "components/ActionBar";
import AuditLogsTable from "components/AuditLogsTable/AuditLogsTable";
import AuditLogsTableActions from "components/AuditLogsTable/AuditLogsTableActions";
import CheckPermissions from "components/CheckPermissions";
import { useAuditLogsPermitted } from "juju/api-hooks/permissions";
import MainContent from "layout/MainContent";

import { Label, TestId } from "./types";

const Logs = (): JSX.Element => {
  const { loading, permitted } = useAuditLogsPermitted();
  return (
    <CheckPermissions
      allowed={permitted}
      data-testid={TestId.COMPONENT}
      loading={loading}
    >
      <MainContent data-testid={TestId.COMPONENT} title={Label.TITLE}>
        <ActionBar>
          <AuditLogsTableActions />
        </ActionBar>
        <AuditLogsTable />
      </MainContent>
    </CheckPermissions>
  );
};

export default Logs;
