import { useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import cloneDeep from "clone-deep";

import useModelStatus from "hooks/useModelStatus";
import useTableRowClick from "hooks/useTableRowClick";

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

export default function Machine() {
  const modelStatusData = useModelStatus();
  const { machineId } = useParams();
  const tableRowClick = useTableRowClick();
  const machine = modelStatusData?.machines[machineId];

  const filteredModelStatusDataByApp = useCallback(
    (machineId) => {
      const filteredModelStatusData = cloneDeep(modelStatusData);
      filteredModelStatusData &&
        Object.keys(filteredModelStatusData.applications).forEach(
          (application) => {
            const units =
              filteredModelStatusData.applications[application]?.units || {};

            if (Object.entries(units).length) {
              Object.values(units).forEach((unit) => {
                if (
                  // Delete any app without a unit matching this machineId...
                  unit.machine !== machineId ||
                  // ...delete any app without units at all
                  !Object.entries(units).length
                ) {
                  delete filteredModelStatusData.applications[application];
                }
              });
            } else {
              delete filteredModelStatusData.applications[application];
            }
          }
        );
      return filteredModelStatusData;
    },
    [modelStatusData]
  );

  const filteredModelStatusDataByUnit = useCallback(
    (machineId) => {
      const filteredModelStatusData = cloneDeep(modelStatusData);
      filteredModelStatusData &&
        Object.keys(filteredModelStatusData.applications).forEach(
          (application) => {
            const units =
              filteredModelStatusData.applications[application].units || {};
            for (let [key, unit] of Object.entries(units)) {
              if (unit.machine !== machineId) {
                delete filteredModelStatusData.applications[application].units[
                  key
                ];
              }
            }
          }
        );
      return filteredModelStatusData;
    },
    [modelStatusData]
  );

  // Generate apps table content
  const applicationRows = useMemo(
    () =>
      generateLocalApplicationRows(
        filteredModelStatusDataByApp(machineId),
        tableRowClick
      ),
    [filteredModelStatusDataByApp, machineId, tableRowClick]
  );

  // Generate units table content
  const unitRows = useMemo(
    () =>
      generateUnitRows(filteredModelStatusDataByUnit(machineId), tableRowClick),
    [filteredModelStatusDataByUnit, machineId, tableRowClick]
  );

  const getHardwareSpecs = () => {
    if (!machine) return {};
    const hardware = {};
    const hardwareArr = machine.hardware.split(" ");
    hardwareArr.forEach((spec) => {
      const [name, value] = spec.split("=");
      hardware[name] = value;
    });
    return hardware;
  };
  const hardware = getHardwareSpecs();

  const MachineEntityData = {
    memory: hardware?.["mem"] || "-",
    disk: hardware?.["root-disk"] || "-",
    cpu: hardware?.["cpu-power"] || "-",
    cores: hardware?.["cores"] || "-",
    message: machine?.["agent-status"].info,
  };

  return (
    <EntityDetails>
      <div className="entity-details__machine">
        <div>
          <InfoPanel />
          <EntityInfo data={MachineEntityData} />
        </div>
        <div className="entity-details__content">
          <>
            <div className="entity-detail__tables">
              <MainTable
                headers={unitTableHeaders}
                rows={unitRows}
                className="entity-details__units p-main-table"
                sortable
                emptyStateMsg={"There are no units in this model"}
              />
              <MainTable
                headers={localApplicationTableHeaders}
                rows={applicationRows}
                className="entity-details__apps p-main-table"
                sortable
                emptyStateMsg={"There are no apps in this model"}
              />
            </div>
          </>
        </div>
      </div>
    </EntityDetails>
  );
}
