import SegmentedControl from "components/SegmentedControl";
import { useQueryParams } from "hooks/useQueryParams";

import "./_logs.scss";
import ActionLogs from "./ActionLogs";
import AuditLogs from "./AuditLogs";

export enum Label {
  ACTION_LOGS = "Action logs",
  AUDIT_LOGS = "Audit logs",
}

const BUTTON_DETAILS = [
  { title: Label.ACTION_LOGS, url: "action-logs" },
  { title: Label.AUDIT_LOGS, url: "audit-logs" },
];

const Logs = () => {
  const [{ tableView }, setQueryParams] = useQueryParams<{
    activeView: string | null;
    tableView: string;
  }>({
    activeView: null,
    tableView: "action-logs",
  });
  return (
    <div className="logs-tab">
      <SegmentedControl
        buttons={BUTTON_DETAILS.map(({ title, url }) => ({
          children: title,
          key: url,
          onClick: () => {
            setQueryParams({ tableView: url });
          },
        }))}
        activeButton={tableView}
      />
      {tableView === "action-logs" && <ActionLogs />}
      {tableView === "audit-logs" && <AuditLogs />}
    </div>
  );
};

export default Logs;
