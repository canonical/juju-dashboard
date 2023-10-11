import FadeIn from "animations/FadeIn";
import ActionBar from "components/ActionBar";
import AuditLogsTable from "components/AuditLogsTable/AuditLogsTable";
import AuditLogsTableActions from "components/AuditLogsTable/AuditLogsTableActions";
import Header from "components/Header/Header";
import BaseLayout from "layout/BaseLayout/BaseLayout";

const Logs = (): JSX.Element => (
  <BaseLayout>
    <Header>
      <b>Audit logs</b>
    </Header>
    <div className="l-content logs">
      <FadeIn isActive={true}>
        <ActionBar>
          <AuditLogsTableActions />
        </ActionBar>
        <div className="u-overflow--auto">
          <AuditLogsTable />
        </div>
      </FadeIn>
    </div>
  </BaseLayout>
);

export default Logs;
