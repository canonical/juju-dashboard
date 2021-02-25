import { useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useQueryParam, StringParam, withDefault } from "use-query-params";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import InfoPanel from "components/InfoPanel/InfoPanel";
import EntityInfo from "components/EntityInfo/EntityInfo";

import EntityDetails from "pages/EntityDetails/EntityDetails";

import useModelStatus from "hooks/useModelStatus";

import {
  extractRevisionNumber,
  generateStatusElement,
  filterModelStatusDataByApp,
} from "app/utils/utils";

import { generateMachineRows, generateUnitRows } from "tables/tableRows";

import { machineTableHeaders, unitTableHeaders } from "tables/tableHeaders";

export default function App() {
  const { modelName, userName, appName: entity } = useParams();
  // Get model status info
  const modelStatusData = useModelStatus();
  const history = useHistory();

  // Filter model status via selected entity
  const filteredModelStatusData = filterModelStatusDataByApp(
    modelStatusData,
    entity
  );

  const app = modelStatusData?.applications[entity];

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

  const showConfig = () => {
    history.push(
      `/models/${userName}/${modelName}/?entity=${entity}&panel=config`
    );
  };

  const AppEntityData = {
    status: app.status?.status ? generateStatusElement(app.status.status) : "-",
    charm: app.charm,
    os: "Ubuntu",
    revision: extractRevisionNumber(app.charm) || "-",
    message: "-",
  };

  return (
    <EntityDetails>
      <div>
        <InfoPanel />
        {modelStatusData && (
          <>
            <div className="entity__actions">
              <button
                className="entity-details__config-button"
                onClick={showConfig}
              >
                <i className="p-icon--settings"></i>Configure
              </button>
            </div>
            <EntityInfo data={AppEntityData} />
          </>
        )}
      </div>
      <div className="entity-details__content">
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
