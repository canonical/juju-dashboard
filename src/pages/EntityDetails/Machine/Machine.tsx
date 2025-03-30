import { MainTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useParams } from "react-router";

import EntityInfo from "components/EntityInfo";
import InfoPanel from "components/InfoPanel";
import type { EntityDetailsRoute } from "components/Routes";
import type { ApplicationData, UnitData } from "juju/types";
import {
  getAllModelApplicationStatus,
  getModelApplications,
  getModelMachines,
  getModelUnits,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import {
  generateLocalApplicationTableHeaders,
  unitTableHeaders,
} from "tables/tableHeaders";
import {
  generateLocalApplicationRows,
  generateUnitRows,
} from "tables/tableRows";

export default function Machine() {
  const { machineId, modelName, userName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const units = useAppSelector((state) => getModelUnits(state, modelUUID));
  const machines = useAppSelector((state) =>
    getModelMachines(state, modelUUID),
  );
  const machine = machineId ? machines?.[machineId] : null;

  const applicationStatuses = useAppSelector((state) =>
    getAllModelApplicationStatus(state, modelUUID),
  );

  const filteredApplicationList = useMemo(() => {
    if (!applications || !units) {
      return null;
    }
    const filteredApps: ApplicationData = {};
    const appList = new Set<string>();
    Object.values(units).forEach((unitData) => {
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
    () =>
      modelName && userName
        ? generateLocalApplicationRows(
            filteredApplicationList,
            applicationStatuses,
            { modelName, userName },
          )
        : [],
    [filteredApplicationList, applicationStatuses, modelName, userName],
  );

  const unitRows = useMemo(
    () =>
      modelName && userName
        ? generateUnitRows(filteredUnitList, { modelName, userName })
        : [],
    [filteredUnitList, modelName, userName],
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
    <>
      <div>
        <InfoPanel />
        <EntityInfo data={MachineEntityData} />
      </div>
      <div className="entity-details__main">
        <MainTable
          headers={unitTableHeaders}
          rows={unitRows}
          className="entity-details__units p-main-table"
          sortable
          emptyStateMsg={"There are no units in this machine"}
        />
        <MainTable
          headers={generateLocalApplicationTableHeaders()}
          rows={applicationRows}
          className="entity-details__apps p-main-table"
          sortable
          emptyStateMsg={"There are no apps in this machine"}
        />
      </div>
    </>
  );
}
