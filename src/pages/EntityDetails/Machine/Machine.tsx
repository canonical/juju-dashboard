import { useMemo } from "react";
import { useParams } from "react-router-dom";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useSelector } from "react-redux";

import useTableRowClick from "hooks/useTableRowClick";

import {
  getModelApplications,
  getModelMachines,
  getModelUnits,
  getModelUUID,
} from "juju/model-selectors";

import {
  generateUnitRows,
  generateLocalApplicationRows,
} from "tables/tableRows";

import {
  localApplicationTableHeaders,
  unitTableHeaders,
} from "tables/tableHeaders";

import EntityDetails from "pages/EntityDetails/EntityDetails";

import EntityInfo from "components/EntityInfo/EntityInfo";
import InfoPanel from "components/InfoPanel/InfoPanel";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { ApplicationData, UnitData } from "juju/types";

export default function Machine() {
  const { machineId, modelName, userName } = useParams<EntityDetailsRoute>();
  const tableRowClick = useTableRowClick();
  const modelUUID = useSelector(getModelUUID(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const machine = machines?.[machineId];

  const filteredApplicationList = useMemo(() => {
    if (!applications || !units) {
      return null;
    }
    const filteredApps: ApplicationData = {};
    const appList = new Set<string>();
    Object.entries(units).forEach(([unitId, unitData]) => {
      if (unitData["machine-id"] === machineId) {
        appList.add(unitData.application);
      }
    });
    [...appList].forEach((appName) => {
      filteredApps[appName] = applications[appName];
    });
    return filteredApps;
  }, [applications, units, machineId]);

  const filteredUnitList = useMemo(() => {
    if (!units) {
      return null;
    }
    const filteredUnits: UnitData = {};
    Object.entries(units).forEach(([unitId, unitData]) => {
      if (unitData["machine-id"] === machineId) {
        filteredUnits[unitId] = unitData;
      }
    });
    return filteredUnits;
  }, [units, machineId]);

  const applicationRows = useMemo(
    () => generateLocalApplicationRows(filteredApplicationList, tableRowClick),
    [filteredApplicationList, tableRowClick]
  );

  const unitRows = useMemo(
    () => generateUnitRows(filteredUnitList, tableRowClick),
    [filteredUnitList, tableRowClick]
  );

  const hardware = machine?.["hardware-characteristics"];
  const MachineEntityData = {
    memory: hardware?.["mem"] || "-",
    disk: hardware?.["root-disk"] || "-",
    cpu: hardware?.["cpu-power"] || "-",
    cores: hardware?.["cpu-cores"] || "-",
    message: machine?.["agent-status"].message || "-",
  };

  return (
    <EntityDetails type="machine">
      <div>
        <InfoPanel />
        <EntityInfo data={MachineEntityData} />
      </div>
      <div className="entity-details__main u-overflow--scroll">
        <div>
          <div className="entity-detail__tables">
            <MainTable
              headers={unitTableHeaders}
              rows={unitRows}
              className="entity-details__units p-main-table"
              sortable
              emptyStateMsg={"There are no units in this machine"}
            />
            <MainTable
              headers={localApplicationTableHeaders}
              rows={applicationRows}
              className="entity-details__apps p-main-table"
              sortable
              emptyStateMsg={"There are no apps in this machine"}
            />
          </div>
        </div>
      </div>
    </EntityDetails>
  );
}
