import useModelStatus from "hooks/useModelStatus";
import { ReactElement } from "react";

import "../_panels.scss";

type Props = {
  entity: string;
};

export default function RemoteAppsPanel({
  entity: appId,
}: Props): ReactElement {
  // Get model status info
  const modelStatusData = useModelStatus();

  const remoteApp = modelStatusData["remote-applications"][appId];

  return (
    <div className="panel">
      <span className="p-muted-heading">flannel:etcd</span>
      <h5>Remote Offer info</h5>
      <table className="panel__table">
        <tbody>
          <tr className="panel__tr">
            <th className="panel__th">Offer name</th>
            <td className="panel__td">{remoteApp["offer-name"]}</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">Application</th>
            <td className="panel__td">-</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">Charm</th>
            <td className="panel__td">-</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">Store</th>
            <td className="panel__td">-</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">URL</th>
            <td className="panel__td">{remoteApp["offer-url"]}</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">Status</th>
            <td className="panel__td">{remoteApp.status.status}</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">Endpoint</th>
            <td className="panel__td">-</td>
          </tr>
          <tr className="panel__tr">
            <th className="panel__th">Interface</th>
            <td className="panel__td">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
