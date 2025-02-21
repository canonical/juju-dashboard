import type { Filters } from "store/juju/utils/models";

import CloudGroup from "./CloudGroup";
import OwnerGroup from "./OwnerGroup";
import StatusGroup from "./StatusGroup";

type Props = {
  groupedBy: string;
  filters: Filters;
};

export default function ModelTableList({ filters, groupedBy }: Props) {
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
