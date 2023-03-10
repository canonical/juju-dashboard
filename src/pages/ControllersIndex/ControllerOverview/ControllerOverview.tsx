import { useSelector } from "react-redux";

import {
  getGroupedMachinesDataByStatus,
  getGroupedApplicationsDataByStatus,
  getGroupedUnitsDataByStatus,
} from "store/juju/selectors";

import ControllerChart from "../ControllerChart/ControllerChart";

import "./_controller-overview.scss";

export default function ControllersOverview() {
  const groupedMachinesDataByStatus = useSelector(
    getGroupedMachinesDataByStatus
  );
  const groupedApplicationsDataByStatus = useSelector(
    getGroupedApplicationsDataByStatus
  );
  const groupedUnitsDataByStatus = useSelector(getGroupedUnitsDataByStatus);

  return (
    <div className="p-strip is-shallow controllers-overview">
      <div className="controllers-overview__container">
        <div className="controllers-overview__chart">
          <ControllerChart
            blocked={groupedMachinesDataByStatus.blocked.length}
            alert={groupedMachinesDataByStatus.alert.length}
            running={groupedMachinesDataByStatus.running.length}
            totalLabel="machine"
          />
        </div>
        <div className="controllers-overview__chart">
          <ControllerChart
            blocked={groupedApplicationsDataByStatus.blocked.length}
            alert={groupedApplicationsDataByStatus.alert.length}
            running={groupedApplicationsDataByStatus.running.length}
            totalLabel="application"
          />
        </div>
        <div className="controllers-overview__chart">
          <ControllerChart
            blocked={groupedUnitsDataByStatus.blocked.length}
            alert={groupedUnitsDataByStatus.alert.length}
            running={groupedUnitsDataByStatus.running.length}
            totalLabel="unit"
          />
        </div>
      </div>
    </div>
  );
}
