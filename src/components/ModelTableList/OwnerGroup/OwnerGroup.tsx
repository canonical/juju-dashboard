import type { JSX, ReactNode } from "react";

import { getGroupedByOwnerAndFilteredModelData } from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import ModelTable from "../ModelTable";
import { GroupBy, TestId } from "../types";

type Props = {
  filters: Filters;
};

export default function OwnerGroup({ filters }: Props): JSX.Element {
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
    <div className="owners-group" {...testId(TestId.OWNER_GROUP)}>
      {ownerTables}
    </div>
  );
}
