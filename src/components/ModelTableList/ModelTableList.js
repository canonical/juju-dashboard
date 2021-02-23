import StatusGroup from "./StatusGroup";
import CloudGroup from "./CloudGroup";
import OwnerGroup from "./OwnerGroup";

import "./_model-table-list.scss";

export default function ModelTableList({ filters, groupedBy }) {
  switch (groupedBy) {
    case "status":
    default:
      return <StatusGroup filters={filters} />;
    case "cloud":
      return <CloudGroup filters={filters} />;
    case "owner":
      return <OwnerGroup filters={filters} />;
  }
}
