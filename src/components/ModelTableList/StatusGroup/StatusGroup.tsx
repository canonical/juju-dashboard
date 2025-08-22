import { getGroupedByStatusAndFilteredModelData } from "store/juju/selectors";
import type { Filters } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import ModelTable from "../ModelTable";
import { TestId } from "../types";

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
          groupBy="status"
          groupLabel="Blocked"
          emptyStateMessage={emptyStateMsg}
        />
      ) : null}
      {alert.length ? (
        <ModelTable
          models={alert}
          groupBy="status"
          groupLabel="Alert"
          emptyStateMessage={emptyStateMsg}
        />
      ) : null}
      {running.length ? (
        <ModelTable
          models={running}
          groupBy="status"
          groupLabel="Running"
          emptyStateMessage={emptyStateMsg}
        />
      ) : null}
    </div>
  );
}
