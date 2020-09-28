import React, { useMemo, useCallback } from "react";
import SlidePanel from "components/SlidePanel/SlidePanel";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import useModelStatus from "hooks/useModelStatus";

import {
  machineTableHeaders,
  applicationTableHeaders,
} from "pages/Models/Details/generators";

import { generateStatusElement, extractRevisionNumber } from "app/utils";

import "./_units-panel.scss";

export default function UnitsPanel({ isActive, onClose, entity: unitId }) {
  const modelStatusData = useModelStatus();
  const appName = unitId?.split("/")[0];
  const unit = modelStatusData?.applications[appName]?.units[unitId];
  const app = modelStatusData?.applications[appName];

  // Generate panel header for given entity
  const generateUnitsPanelHeader = useCallback(() => {
    return (
      <div className="panel-header">
        {unit && (
          <div className="row">
            <div className="col-4">
              <div className="units-panel__id">
                <strong>
                  <span className="entity-name">{unitId}</span>
                </strong>
              </div>
              <span className="u-capitalise">
                {generateStatusElement(unit.agentStatus.status)}
              </span>
            </div>
            <div className="col-4">
              <div className="panel__kv">
                <span className="panel__label">Charm</span>
                <span className="panel__value">{app.charm || "-"}</span>
              </div>
              <div className="panel__kv">
                <span className="panel__label">OS</span>
                <span className="panel__value">{"-"}</span>
              </div>
              <div className="panel__kv">
                <span className="panel__label">Revision</span>
                <span className="panel__value">
                  {extractRevisionNumber(app.charm) || "-"}
                </span>
              </div>
              <div className="panel__kv">
                <span className="panel__label">Version</span>
                <span className="panel__value">
                  {app.workloadVersion || "-"}
                </span>
              </div>
            </div>
            <div className="col-4">{app.status.info}</div>
          </div>
        )}
      </div>
    );
  }, [app, unit, unitId]);

  const machinePanelHeader = useMemo(
    () => generateUnitsPanelHeader(modelStatusData?.applications[unitId]),
    [modelStatusData, unitId, generateUnitsPanelHeader]
  );

  // Check for loading status
  const isLoading = !modelStatusData?.machines;

  return (
    <SlidePanel
      isActive={isActive}
      onClose={onClose}
      isLoading={isLoading}
      className="units-panel"
    >
      <>
        {machinePanelHeader}
        <div className="slide-panel__tables">
          <MainTable
            headers={machineTableHeaders}
            rows={[]} // Temp disable
            className="model-details__machines p-main-table"
            sortable
            emptyStateMsg={"There are no machines in this model"}
          />
          <MainTable
            headers={applicationTableHeaders}
            rows={[]} // Temp disable
            className="model-details__apps p-main-table"
            sortable
            emptyStateMsg={"There are no apps in this model"}
          />
        </div>
      </>
    </SlidePanel>
  );
}
