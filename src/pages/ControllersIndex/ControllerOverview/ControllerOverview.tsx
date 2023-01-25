import { useSelector } from "react-redux";

import {
  getGroupedMachinesDataByStatus,
  getGroupedApplicationsDataByStatus,
  getGroupedUnitsDataByStatus,
} from "app/selectors";

import { RootState } from "store/store";
import { ModelData } from "types";

import ControllerChart from "../ControllerChart/ControllerChart";

import "./_controller-overview.scss";

export default function ControllersOverview() {
  // TSFixme: these generics can be removed when the selectors have been
  // migrated to TypeScript.
  const groupedMachinesDataByStatus = useSelector<
    RootState,
    Record<string, ModelData["machines"][0][]>
  >(getGroupedMachinesDataByStatus);
  // TSFixme: these generics can be removed when the selectors have been
  // migrated to TypeScript.
  const groupedApplicationsDataByStatus = useSelector<
    RootState,
    Record<string, ModelData["applications"][0][]>
  >(getGroupedApplicationsDataByStatus);
  // TSFixme: these generics can be removed when the selectors have been
  // migrated to TypeScript.
  const groupedUnitsDataByStatus = useSelector<
    RootState,
    Record<string, ModelData["applications"][0]["units"][0][]>
  >(getGroupedUnitsDataByStatus);

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
