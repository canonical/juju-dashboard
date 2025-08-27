import { getGroupedByStatusAndFilteredModelData } from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import ModelTable from "../ModelTable";
import { GroupBy, TestId } from "../types";

export default function StatusGroup({ filters }: { filters: Filters }) {
  const { alert, blocked, running } = useAppSelector((state) =>
    getGroupedByStatusAndFilteredModelData(state, filters),
  );
  const emptyStateMsg = "There are no models with this status";

  return (
    <div className="status-group" data-testid={TestId.STATUS_GROUP}>
      {blocked.length ? (
        <ModelTable
          models={blocked}
          groupBy={GroupBy.STATUS}
          groupLabel="Blocked"
          emptyStateMessage={emptyStateMsg}
        />
      ) : null}
      {alert.length ? (
        <ModelTable
          models={alert}
          groupBy={GroupBy.STATUS}
          groupLabel="Alert"
          emptyStateMessage={emptyStateMsg}
        />
      ) : null}
      {running.length ? (
        <ModelTable
          models={running}
          groupBy={GroupBy.STATUS}
          groupLabel="Running"
          emptyStateMessage={emptyStateMsg}
        />
      ) : null}
    </div>
  );
}
