import type { JSX } from "react";

import ActionBar from "components/ActionBar";
import AuditLogsTable from "components/AuditLogsTable/AuditLogsTable";
import AuditLogsTableActions from "components/AuditLogsTable/AuditLogsTableActions";
import CheckPermissions from "components/CheckPermissions";
import { useAuditLogsPermitted } from "juju/api-hooks/permissions";
import BaseLayout from "layout/BaseLayout/BaseLayout";

import { Label, TestId } from "./types";

const Logs = (): JSX.Element => {
  const { loading, permitted } = useAuditLogsPermitted();
  return (
    <CheckPermissions
      allowed={permitted}
      data-testid={TestId.COMPONENT}
      loading={loading}
    >
      <BaseLayout data-testid={TestId.COMPONENT} title={Label.TITLE}>
        <ActionBar>
          <AuditLogsTableActions />
        </ActionBar>
        <AuditLogsTable />
      </BaseLayout>
    </CheckPermissions>
  );
};

export default Logs;
