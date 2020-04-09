import React from "react";
import { useSelector } from "react-redux";

import {
  getGroupedMachinesDataByStatus,
  getGroupedApplicationsDataByStatus,
  getGroupedUnitsDataByStatus,
} from "app/selectors";
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

  let machinesChartData = {
    blocked: groupedMachinesDataByStatus.blocked.length,
    alert: groupedMachinesDataByStatus.alert.length,
    running: groupedMachinesDataByStatus.running.length,
  };
  let applicationsChartData = {
    blocked: groupedApplicationsDataByStatus.blocked.length,
    alert: groupedApplicationsDataByStatus.alert.length,
    running: groupedApplicationsDataByStatus.running.length,
  };
  let unitsChartData = {
    blocked: groupedUnitsDataByStatus.blocked.length,
    alert: groupedUnitsDataByStatus.alert.length,
    running: groupedUnitsDataByStatus.running.length,
  };

  return (
    <div className="p-strip is-shallow controllers-overview">
      <h5>Model status across controllers</h5>
      <div className="controllers-overview__container">
        <div className="controllers-overview__chart">
          <ControllerChart chartData={machinesChartData} totalLabel="machine" />
        </div>
        <div className="controllers-overview__chart">
          <ControllerChart
            chartData={applicationsChartData}
            totalLabel="application"
          />
        </div>
        <div className="controllers-overview__chart">
          <ControllerChart chartData={unitsChartData} totalLabel="unit" />
        </div>
      </div>
    </div>
  );
}
