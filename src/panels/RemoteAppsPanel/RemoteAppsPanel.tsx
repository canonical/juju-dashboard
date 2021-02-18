import useModelStatus from "hooks/useModelStatus";
import type { TSFixMe } from "types";

import { generatePanelTableRows } from "../shared";

import "../_panels.scss";

type Props = {
  entity: string;
};

type tableData = {
  th: string;
  td: string;
};

export default function RemoteAppsPanel({ entity: appId }: Props): JSX.Element {
  // Get model status info
  const modelStatusData: TSFixMe = useModelStatus();

  const remoteApp = modelStatusData["remote-applications"]?.[appId];

  const tableDataArr: tableData[] = [
    { th: "Offer name", td: remoteApp["offer-name"] || "-" },
    { th: "Application", td: "-" },
    { th: "Charm", td: "-" },
    { th: "Store", td: "-" },
    { th: "Application", td: remoteApp["offer-url"] || "-" },
    { th: "Status", td: remoteApp.status.status || "-" },
    { th: "Endpoint", td: "-" },
    { th: "Interface", td: "-" },
  ];

  return (
    <div className="panel">
      <span className="p-muted-heading">flannel:etcd</span>
      <h5>Remote Offer info</h5>
      <table className="panel__table">
        <tbody>{generatePanelTableRows(tableDataArr)}</tbody>
      </table>
    </div>
  );
}
