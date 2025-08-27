import type { ReactNode } from "react";

import { getGroupedByCloudAndFilteredModelData } from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import ModelTable from "../ModelTable";
import { GroupBy, TestId } from "../types";

type Props = {
  filters: Filters;
};

export default function CloudGroup({ filters }: Props) {
  const groupedAndFilteredData = useAppSelector((state) =>
    getGroupedByCloudAndFilteredModelData(state, filters),
  );

  const cloudTables: ReactNode[] = [];
  for (const cloud in groupedAndFilteredData) {
    cloudTables.push(
      <ModelTable
        key={cloud}
        groupBy={GroupBy.CLOUD}
        groupLabel={cloud}
        models={groupedAndFilteredData[cloud]}
      />,
    );
  }

  return (
    <div className="cloud-group" data-testid={TestId.CLOUD_GROUP}>
      {cloudTables}
    </div>
  );
}
