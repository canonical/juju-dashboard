import { MainTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  generateLocalApplicationTableHeaders,
  machineTableHeaders,
} from "tables/tableHeaders";

import {
  generateLocalApplicationRows,
  generateMachineRows,
} from "tables/tableRows";

import { extractRevisionNumber } from "store/juju/utils/models";

import EntityInfo from "components/EntityInfo/EntityInfo";
import InfoPanel from "components/InfoPanel/InfoPanel";

import {
  getAllModelApplicationStatus,
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelUnits,
  getModelUUIDFromList,
} from "store/juju/selectors";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { ApplicationData, MachineData } from "juju/types";

export default function Unit() {
  const { modelName, userName, unitId } = useParams<EntityDetailsRoute>();
  // The unit name might have a dash in it so we need to grab only the last one
  // ex) content-cache-0.
  const unitIdentifier = unitId?.replace(/-(\d+)$/, "/$1");

  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const modelData = useSelector(getModelInfo(modelUUID));

  const filteredMachineList = useMemo(() => {
    const filteredMachines: MachineData = {};
    if (machines && units && unitIdentifier) {
      const machineId = units[unitIdentifier]["machine-id"];
      filteredMachines[machineId] = machines[machineId];
    }
    return filteredMachines;
  }, [machines, units, unitIdentifier]);

  const filteredApplicationList = useMemo(() => {
    const filteredApps: ApplicationData = {};
    if (applications && units && unitIdentifier) {
      const appName = units[unitIdentifier].application;
      filteredApps[appName] = applications[appName];
    }
    return filteredApps;
  }, [applications, units, unitIdentifier]);

  const applicationStatuses = useSelector(
    getAllModelApplicationStatus(modelUUID)
  );

  const machineRows = useMemo(
    () =>
      modelName && userName
        ? generateMachineRows(filteredMachineList, units, {
            modelName,
            userName,
          })
        : [],
    [filteredMachineList, units, modelName, userName]
  );

  const applicationRows = useMemo(
    () =>
      modelName && userName
        ? generateLocalApplicationRows(
            filteredApplicationList,
            applicationStatuses,
            { modelName, userName }
          )
        : [],
    [filteredApplicationList, applicationStatuses, modelName, userName]
  );

  const unit = unitIdentifier ? units?.[unitIdentifier] : null;
  let unitEntityData = {};
  if (unit) {
    const charm = unit?.["charm-url"] || "-";
    unitEntityData = {
      charm,
      os: "-",
      revision: extractRevisionNumber(charm) || "-",
      version: unit?.["workload-status"].version || "-",
      message: unit?.["workload-status"].message || "-",
    };
  }

  return (
    <>
      <div>
        <InfoPanel />
        <EntityInfo data={unitEntityData} />
      </div>
      <div className="entity-details__main u-overflow--auto">
        <div className="slide-panel__tables">
          {modelData?.type !== "kubernetes" && (
            <MainTable
              headers={machineTableHeaders}
              rows={machineRows}
              className="entity-details__machines p-main-table"
              sortable
              emptyStateMsg={"There are no machines in this model"}
            />
          )}
          <MainTable
            headers={generateLocalApplicationTableHeaders(false)}
            rows={applicationRows}
            className="entity-details__apps p-main-table"
            sortable
            emptyStateMsg={"There are no apps in this model"}
          />
        </div>
      </div>
    </>
  );
}
