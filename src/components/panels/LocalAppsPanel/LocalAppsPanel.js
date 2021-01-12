import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getConfig } from "app/selectors";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import useModelStatus from "hooks/useModelStatus";

import {
  generateEntityIdentifier,
  unitTableHeaders,
  machineTableHeaders,
  generateMachineRows,
  generateUnitRows,
} from "pages/Models/Details/generators";

import {
  extractRevisionNumber,
  generateStatusElement,
  filterModelStatusDataByApp,
} from "app/utils";

import ConfigPanel from "../ConfigPanel/ConfigPanel";

import "../_panels.scss";

// Generate panel header for given entity
const generateAppPanelHeader = (
  app,
  title,
  showConfig,
  showConfigurationUI
) => {
  return (
    <div className="panel-header">
      {app && (
        <div className="row">
          <div className="col-4">
            <div>{title}</div>
            <span className="u-capitalise">
              {app.status?.status
                ? generateStatusElement(app.status.status)
                : "-"}
            </span>
            {showConfigurationUI && (
              <div>
                <button onClick={showConfig}>Config</button>
              </div>
            )}
          </div>
          <div className="col-4">
            <div className="panel__kv">
              <span className="panel__label">Charm: </span>
              <span title={app.charm} className="panel__value">
                {app.charm}
              </span>
            </div>

            <div className="panel__kv">
              <span className="panel__label">OS:</span>
              <span className="panel__value">Ubuntu</span>
            </div>

            <div className="panel__kv">
              <span className="panel__label">Revision:</span>
              <span className="panel__value">
                {extractRevisionNumber(app.charm) || "-"}
              </span>
            </div>

            <div className="panel__kv">
              <span className="panel__label">Version:</span>
              <span className="panel__value">
                {app["workload-version"] || "-"}
              </span>
            </div>
          </div>
          <div className="col-4">
            {/* Notes - not currently implemented/available */}
          </div>
        </div>
      )}
    </div>
  );
};

export default function LocalAppsPanel({ entity, panelRowClick }) {
  // Get model status info
  const modelStatusData = useModelStatus();

  const { baseAppURL, showConfigurationUI } = useSelector(getConfig);
  const [shouldShowConfig, setShouldShowConfig] = useState(false);

  // Filter model status via selected entity
  const filteredModelStatusData = filterModelStatusDataByApp(
    modelStatusData,
    entity
  );

  const title = generateEntityIdentifier(
    modelStatusData?.applications[entity].charm,
    entity,
    false,
    baseAppURL,
    true // disable link
  );

  const appPanelHeader = useMemo(
    () =>
      generateAppPanelHeader(
        modelStatusData?.applications[entity],
        title,
        (e) => {
          // Required to prevent the click from bubbling and
          // closing the slide panel.
          e.stopPropagation();
          setShouldShowConfig(true);
        },
        showConfigurationUI
      ),
    [modelStatusData, entity, title, showConfigurationUI]
  );

  const machinesPanelRows = useMemo(
    () => generateMachineRows(filteredModelStatusData, panelRowClick),
    [filteredModelStatusData, panelRowClick]
  );

  const unitPanelRows = useMemo(
    () => generateUnitRows(filteredModelStatusData, panelRowClick),
    [filteredModelStatusData, panelRowClick]
  );

  return (
    <>
      {shouldShowConfig ? (
        <ConfigPanel
          appName={entity}
          title={title}
          modelUUID={modelStatusData.uuid}
        />
      ) : (
        <>
          {appPanelHeader}
          <div className="slide-panel__tables">
            <MainTable
              headers={unitTableHeaders}
              rows={unitPanelRows}
              className="model-details__units p-main-table panel__table"
              sortable
              emptyStateMsg={"There are no units in this model"}
            />
            <MainTable
              headers={machineTableHeaders}
              rows={machinesPanelRows}
              className="model-details__machines p-main-table panel__table"
              sortable
              emptyStateMsg={"There are no machines in this model"}
            />
          </div>
        </>
      )}
    </>
  );
}
