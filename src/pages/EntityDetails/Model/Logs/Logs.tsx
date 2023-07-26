import SegmentedControl from "components/SegmentedControl";
import { useQueryParams } from "hooks/useQueryParams";

import ActionLogs from "./ActionLogs";

import "./_logs.scss";

export enum Label {
  ACTION_LOGS = "Action logs",
}

const Logs = () => {
  const [{ activeView }, setQueryParams] = useQueryParams<{
    activeView: string | null;
  }>({
    activeView: null,
  });
  return (
    <div className="logs-tab">
      <SegmentedControl
        buttons={[{ title: Label.ACTION_LOGS, url: "action-logs" }].map(
          ({ title, url }) => ({
            children: title,
            key: url,
            onClick: () => {
              setQueryParams({ activeView: url });
            },
          })
        )}
        activeButton={activeView}
      />
      {activeView === "action-logs" ? <ActionLogs /> : null}
    </div>
  );
};

export default Logs;
