import type { ReactNode } from "react";

import { getGroupedByOwnerAndFilteredModelData } from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import ModelTable from "../ModelTable";
import { GroupBy, TestId } from "../types";

type Props = {
  filters: Filters;
};

export default function OwnerGroup({ filters }: Props) {
  const groupedAndFilteredData = useAppSelector((state) =>
    getGroupedByOwnerAndFilteredModelData(state, filters),
  );

  const ownerTables: ReactNode[] = [];
  for (const owner in groupedAndFilteredData) {
    ownerTables.push(
      <ModelTable
        key={owner}
        groupBy={GroupBy.OWNER}
        groupLabel={owner}
        models={groupedAndFilteredData[owner]}
      />,
    );
  }
  return (
    <div className="owners-group" data-testid={TestId.OWNER_GROUP}>
      {ownerTables}
    </div>
  );
}
