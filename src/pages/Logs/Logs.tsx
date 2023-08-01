import FadeIn from "animations/FadeIn";
import AuditLogsTable from "components/AuditLogsTable/AuditLogsTable";
import Header from "components/Header/Header";
import BaseLayout from "layout/BaseLayout/BaseLayout";

const Logs = (): JSX.Element => (
  <BaseLayout>
    <Header>
      <b>Audit logs</b>
    </Header>
    <div className="l-content logs u-overflow--auto">
      <FadeIn isActive={true}>
        <AuditLogsTable showModel />
      </FadeIn>
    </div>
  </BaseLayout>
);

export default Logs;
