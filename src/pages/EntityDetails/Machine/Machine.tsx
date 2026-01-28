import { MainTable } from "@canonical/react-components";
import type { JSX } from "react";
import { useMemo } from "react";
import { useParams } from "react-router";

import EntityInfo from "components/EntityInfo";
import InfoPanel from "components/InfoPanel";
import type { EntityDetailsRoute } from "components/Routes";
import {
  getAllModelApplicationStatus,
  getMachineApps,
  getMachineUnits,
  getModelApplications,
  getModelMachines,
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
import { parseMachineHardware } from "utils/parseMachineHardware";

export default function Machine(): JSX.Element {
  const {
    machineId = null,
    modelName = null,
    userName = null,
  } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const machines = useAppSelector((state) =>
    getModelMachines(state, modelUUID),
  );
  const machine = machineId ? machines?.[machineId] : null;
  const applicationStatuses = useAppSelector((state) =>
    getAllModelApplicationStatus(state, modelUUID),
  );
  const filteredApplicationList = useAppSelector((state) =>
    getMachineApps(state, modelUUID, machineId),
  );
  const filteredUnitList = useAppSelector((state) =>
    getMachineUnits(state, modelUUID, machineId, false),
  );

  const applicationRows = useMemo(
    () =>
      modelName && userName
        ? generateLocalApplicationRows(
            Object.keys(filteredApplicationList ?? {}),
            applications,
            applicationStatuses,
            { modelName, userName },
          )
        : [],
    [
      modelName,
      userName,
      filteredApplicationList,
      applications,
      applicationStatuses,
    ],
  );

  const unitRows = useMemo(
    () =>
      modelName && userName
        ? generateUnitRows(applications, filteredUnitList, {
            modelName,
            userName,
          })
        : [],
    [applications, filteredUnitList, modelName, userName],
  );

  const hardware = parseMachineHardware(machine?.hardware);
  const machineEntityData = {
    memory: hardware.mem ?? "-",
    disk: hardware["root-disk"] ?? "-",
    cpu: hardware["cpu-power"] ?? "-",
    cores: hardware["cpu-cores"] ?? "-",
    message: machine?.["agent-status"].info || "-",
  };

  return (
    <>
      <div>
        <InfoPanel />
        <EntityInfo data={machineEntityData} />
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
