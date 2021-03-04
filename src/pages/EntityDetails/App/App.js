import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useQueryParam,
  useQueryParams,
  StringParam,
  withDefault,
} from "use-query-params";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import InfoPanel from "components/InfoPanel/InfoPanel";
import EntityInfo from "components/EntityInfo/EntityInfo";
import ChipGroup from "components/ChipGroup/ChipGroup";

import EntityDetails from "pages/EntityDetails/EntityDetails";

import useModelStatus from "hooks/useModelStatus";
import useTableRowClick from "hooks/useTableRowClick";

import {
  extractRevisionNumber,
  generateStatusElement,
  filterModelStatusDataByApp,
} from "app/utils/utils";

import { generateMachineRows, generateUnitRows } from "tables/tableRows";

import { machineTableHeaders, unitTableHeaders } from "tables/tableHeaders";

import { renderCounts } from "../counts";

export default function App() {
  const { appName: entity } = useParams();
  // Get model status info
  const modelStatusData = useModelStatus();

  const tableRowClick = useTableRowClick();

  // Filter model status via selected entity
  const filteredModelStatusData = filterModelStatusDataByApp(
    modelStatusData,
    entity
  );

  const app = modelStatusData?.applications[entity];

  const machinesPanelRows = useMemo(
    () => generateMachineRows(filteredModelStatusData, tableRowClick),
    [filteredModelStatusData, tableRowClick]
  );

  const unitPanelRows = useMemo(
    () => generateUnitRows(filteredModelStatusData, tableRowClick),
    [filteredModelStatusData, tableRowClick]
  );

  const [tableView, setTableView] = useQueryParam(
    "tableview",
    withDefault(StringParam, "units")
  );

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });

  const showConfig = () => {
    query && setQuery({ panel: "config", entity: entity });
  };

  const AppEntityData = {
    status:
      app && app.status?.status
        ? generateStatusElement(app.status.status)
        : "-",
    charm: app?.charm,
    os: "Ubuntu",
    revision: (app && extractRevisionNumber(app.charm)) || "-",
    message: "-",
  };

  const unitChips = renderCounts("units", modelStatusData);
  const machineChips = renderCounts("machines", modelStatusData);

  return (
    <EntityDetails className="entity-details__app">
      <div>
        <InfoPanel />
        <>
          <div className="entity-details__actions">
            <button
              className="entity-details__action-button"
              onClick={showConfig}
            >
              <i className="p-icon--settings"></i>Configure
            </button>
          </div>
          <EntityInfo data={AppEntityData} />
        </>
      </div>
      <div className="entity-details__main u-overflow--scroll">
        <ButtonGroup
          buttons={["units", "machines"]}
          activeButton={tableView}
          setActiveButton={setTableView}
        />
        <div className="entity-details__tables">
          {tableView === "units" && (
            <>
              <ChipGroup chips={unitChips} descriptor="units" />
              <MainTable
                headers={unitTableHeaders}
                rows={unitPanelRows}
                className="entity-details__units p-main-table panel__table"
                sortable
                emptyStateMsg={"There are no units in this model"}
              />
            </>
          )}
          {tableView === "machines" && (
            <>
              <ChipGroup chips={machineChips} descriptor="machines" />
              <MainTable
                headers={machineTableHeaders}
                rows={machinesPanelRows}
                className="entity-details__machines p-main-table panel__table"
                sortable
                emptyStateMsg={"There are no machines in this model"}
              />
            </>
          )}
        </div>
      </div>
    </EntityDetails>
  );
}
