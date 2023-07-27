import AuditLogsTable from "components/AuditLogsTable";

const AuditLogs = (): JSX.Element => (
  <div className="entity-details__audit-logs">
    <AuditLogsTable showModel={false} />
  </div>
);

export default AuditLogs;
