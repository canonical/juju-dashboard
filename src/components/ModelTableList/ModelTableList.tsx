import type { Filters } from "store/juju/utils/models";

import CloudGroup from "./CloudGroup";
import OwnerGroup from "./OwnerGroup";
import StatusGroup from "./StatusGroup";
import { GroupBy } from "./types";

type Props = {
  groupedBy: string;
  filters: Filters;
};

export default function ModelTableList({ filters, groupedBy }: Props) {
  switch (groupedBy) {
    case GroupBy.STATUS:
    default:
      return <StatusGroup filters={filters} />;
    case GroupBy.CLOUD:
      return <CloudGroup filters={filters} />;
    case GroupBy.OWNER:
      return <OwnerGroup filters={filters} />;
  }
}
