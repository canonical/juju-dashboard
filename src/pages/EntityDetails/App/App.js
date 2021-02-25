import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getConfig } from "app/selectors";
import { useParams, useHistory } from "react-router-dom";
import { useQueryParam, StringParam, withDefault } from "use-query-params";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";

import EntityDetails from "pages/EntityDetails/EntityDetails";

import useModelStatus from "hooks/useModelStatus";

import {
  generateEntityIdentifier,
  extractRevisionNumber,
  generateStatusElement,
  filterModelStatusDataByApp,
} from "app/utils/utils";

import { generateMachineRows, generateUnitRows } from "tables/tableRows";

import { machineTableHeaders, unitTableHeaders } from "tables/tableHeaders";

// Generate panel header for given entity
const generateAppPageHeader = (app, title, showConfig) => {
  return (
    <div className="entity-details__content-header">
      {app && (
        <>
          <div>
            <div>{title}</div>
            <span className="u-capitalise">
              {app.status?.status
                ? generateStatusElement(app.status.status)
                : "-"}
            </span>
            <div>
              <button
                className="entity-details__config-button"
                onClick={showConfig}
              >
                <i className="p-icon--settings"></i>Configure
              </button>
            </div>
          </div>
          <div>
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
        </>
      )}
    </div>
  );
};

export default function App() {
  const { modelName, userName, appName: entity } = useParams();
  // Get model status info
  const modelStatusData = useModelStatus();
  const history = useHistory();

  const { baseAppURL } = useSelector(getConfig);

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

  const appPageHeader = useMemo(
    () =>
      generateAppPageHeader(
        modelStatusData?.applications[entity],
        title,
        (e) => {
          history.push(
            `/models/${userName}/${modelName}/?entity=${entity}&panel=config`
          );
          // Required to prevent the click from bubbling and
          // closing the slide panel.
          e.stopPropagation();
        }
      ),
    [modelStatusData, entity, title, history, modelName, userName]
  );

  const machinesPanelRows = useMemo(
    () => generateMachineRows(filteredModelStatusData),
    [filteredModelStatusData]
  );

  const unitPanelRows = useMemo(
    () => generateUnitRows(filteredModelStatusData),
    [filteredModelStatusData]
  );

  const [tableView, setTableView] = useQueryParam(
    "tableview",
    withDefault(StringParam, "units")
  );

  return (
    <EntityDetails>
      <div className="entity-details__content">
        {appPageHeader}
        <ButtonGroup
          buttons={["units", "machines"]}
          activeButton={tableView}
          setActiveButton={setTableView}
        />
        <div className="entity-details__tables">
          {tableView === "units" && (
            <MainTable
              headers={unitTableHeaders}
              rows={unitPanelRows}
              className="entity-details__units p-main-table panel__table"
              sortable
              emptyStateMsg={"There are no units in this model"}
            />
          )}
          {tableView === "machines" && (
            <MainTable
              headers={machineTableHeaders}
              rows={machinesPanelRows}
              className="entity-details__machines p-main-table panel__table"
              sortable
              emptyStateMsg={"There are no machines in this model"}
            />
          )}
        </div>
      </div>
    </EntityDetails>
  );
}