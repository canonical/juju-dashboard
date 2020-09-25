import React, { useMemo } from "react";
import SlidePanel from "components/SlidePanel/SlidePanel";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import useModelStatus from "hooks/useModelStatus";

import {
  unitTableHeaders,
  applicationTableHeaders,
} from "pages/Models/Details/generators";

import { generateStatusElement } from "app/utils";

import "./_machines-panel.scss";

export default function MachinesPanel({
  isActive,
  onClose,
  entity: machineId,
}) {
  const modelStatusData = useModelStatus();
  const machine = modelStatusData?.machines[machineId];

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

  // Generate panel header for given entity
  const generateMachinesPanelHeader = () => {
    const hardware = getHardwareSpecs();
    return (
      <div className="panel-header">
        {machine && (
          <div className="row">
            <div className="col-4">
              <div className="machine-panel__id">
                <strong>
                  Machine '{machineId}' - {machine?.series}
                </strong>
              </div>
              <span className="u-capitalise">
                {generateStatusElement(machine.agentStatus.status)}
              </span>
              <span>{}</span>
            </div>

            <div className="col-4">
              <div className="panel__kv">
                <span className="panel__label">Memory</span>
                <span className="panel__value">{hardware["mem"] || "-"}</span>
              </div>
              <div className="panel__kv">
                <span className="panel__label">Disk</span>
                <span className="panel__value">
                  {hardware["root-disk"] || "-"}
                </span>
              </div>
              <div className="panel__kv">
                <span className="panel__label">CPU</span>
                <span className="panel__value">
                  {hardware["cpu-power"] || "-"}
                </span>
              </div>
              <div className="panel__kv">
                <span className="panel__label">Cores</span>
                <span className="panel__value">{hardware["cores"] || "-"}</span>
              </div>
            </div>
            <div className="col-4">{machine.agentStatus.info}</div>
          </div>
        )}
      </div>
    );
  };

  const machinePanelHeader = useMemo(
    () => generateMachinesPanelHeader(modelStatusData?.applications[machineId]),
    [modelStatusData, machineId]
  );

  // Check for loading status
  const isLoading = !modelStatusData?.machines;

  return (
    <SlidePanel isActive={isActive} onClose={onClose} isLoading={isLoading}>
      <div className="apps-panel">
        {machinePanelHeader}
        <div className="slide-panel__tables">
          <MainTable
            headers={unitTableHeaders}
            rows={{}} // Temp disable
            className="model-details__units p-main-table"
            sortable
            emptyStateMsg={"There are no units in this model"}
          />
          <MainTable
            headers={applicationTableHeaders}
            rows={{}} // Temp disable
            className="model-details__apps p-main-table"
            sortable
            emptyStateMsg={"There are no apps in this model"}
          />
        </div>
      </div>
    </SlidePanel>
  );
}
