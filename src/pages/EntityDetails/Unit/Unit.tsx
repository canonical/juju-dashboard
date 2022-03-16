import { useMemo } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import useTableRowClick from "hooks/useTableRowClick";

import {
  machineTableHeaders,
  localApplicationTableHeaders,
} from "tables/tableHeaders";

import {
  generateMachineRows,
  generateLocalApplicationRows,
} from "tables/tableRows";

import { extractRevisionNumber } from "app/utils/utils";

import EntityDetails from "pages/EntityDetails/EntityDetails";
import InfoPanel from "components/InfoPanel/InfoPanel";
import EntityInfo from "components/EntityInfo/EntityInfo";

import {
  getModelApplications,
  getAllModelApplicationStatus,
  getModelInfo,
  getModelMachines,
  getModelUnits,
  getModelUUID,
} from "juju/model-selectors";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { ApplicationData, MachineData } from "juju/types";

export default function Unit() {
  const { modelName, userName, unitId } = useParams<EntityDetailsRoute>();
  // The unit name might have a dash in it so we need to grab only the last one
  // ex) content-cache-0.
  const unitIdentifier = unitId.replace(/-(\d+)$/, "/$1");
  const tableRowClick = useTableRowClick();

  const modelUUID = useSelector(getModelUUID(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const modelData = useSelector(getModelInfo(modelUUID));

  const filteredMachineList = useMemo(() => {
    const filteredMachines: MachineData = {};
    if (machines && units) {
      const machineId = units[unitIdentifier]["machine-id"];
      filteredMachines[machineId] = machines[machineId];
    }
    return filteredMachines;
  }, [machines, units, unitIdentifier]);

  const filteredApplicationList = useMemo(() => {
    const filteredApps: ApplicationData = {};
    if (applications && units) {
      const appName = units[unitIdentifier].application;
      filteredApps[appName] = applications[appName];
    }
    return filteredApps;
  }, [applications, units, unitIdentifier]);

  const applicationStatuses = useSelector(
    getAllModelApplicationStatus(modelUUID)
  );

  const machineRows = useMemo(
    () => generateMachineRows(filteredMachineList, units, tableRowClick),
    [filteredMachineList, units, tableRowClick]
  );

  const applicationRows = useMemo(
    () =>
      generateLocalApplicationRows(
        filteredApplicationList,
        applicationStatuses,
        tableRowClick
      ),
    [filteredApplicationList, applicationStatuses, tableRowClick]
  );

  const unit = units?.[unitIdentifier];
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
    <EntityDetails type="unit">
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
            headers={localApplicationTableHeaders}
            rows={applicationRows}
            className="entity-details__apps p-main-table"
            sortable
            emptyStateMsg={"There are no apps in this model"}
          />
        </div>
      </div>
    </EntityDetails>
  );
}
