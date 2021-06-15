import { useMemo, useCallback } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import {
  useQueryParams,
  useQueryParam,
  StringParam,
  withDefault,
} from "use-query-params";
import { useHistory, useParams } from "react-router-dom";
import { pluralize, extractCloudName } from "app/utils/utils";

import {
  appsOffersTableHeaders,
  machineTableHeaders,
  relationTableHeaders,
  offersTableHeaders,
  consumedTableHeaders,
  localApplicationTableHeaders,
  remoteApplicationTableHeaders,
} from "tables/tableHeaders";

import {
  generateLocalApplicationRows,
  generateRemoteApplicationRows,
  generateConsumedRows,
  generateMachineRows,
  generateRelationRows,
  generateOffersRows,
  generateAppOffersRows,
} from "tables/tableRows";

import InfoPanel from "components/InfoPanel/InfoPanel";
import ContentReveal from "components/ContentReveal/ContentReveal";

import EntityDetails from "pages/EntityDetails/EntityDetails";
import EntityInfo from "components/EntityInfo/EntityInfo";
import ActionLogs from "pages/EntityDetails/Model/ActionLogs/ActionLogs";

import useModelStatus from "hooks/useModelStatus";
import useTableRowClick from "hooks/useTableRowClick";

import ChipGroup from "components/ChipGroup/ChipGroup";

import { renderCounts } from "../counts";

const shouldShow = (segment, activeView) => {
  switch (activeView) {
    case "apps":
      if (segment === "apps") {
        return true;
      }
      return false;
    case "units":
    case "machines":
    case "integrations":
    case "action-logs":
      if (segment === "relations-title") {
        return true;
      }
      return segment === activeView;
  }
};

const Model = () => {
  const modelStatusData = useModelStatus();
  const history = useHistory();
  const { userName, modelName } = useParams();

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });

  const tableRowClick = useTableRowClick();

  const panelRowClick = useCallback(
    (entityName, entityPanel) => {
      // This can be removed when all entities are moved to top level aside panels
      if (entityPanel === "apps") {
        history.push(`/models/${userName}/${modelName}/app/${entityName}`);
      } else {
        return setQuery({ panel: entityPanel, entity: entityName });
      }
    },
    [setQuery, history, modelName, userName]
  );

  const localApplicationTableRows = useMemo(() => {
    return generateLocalApplicationRows(modelStatusData, tableRowClick, query);
  }, [modelStatusData, tableRowClick, query]);
  const remoteApplicationTableRows = useMemo(() => {
    return generateRemoteApplicationRows(modelStatusData, panelRowClick, query);
  }, [modelStatusData, panelRowClick, query]);

  const machinesTableRows = useMemo(() => {
    return generateMachineRows(modelStatusData, tableRowClick, query?.entity);
  }, [modelStatusData, tableRowClick, query]);

  const relationTableRows = useMemo(
    () => generateRelationRows(modelStatusData),
    [modelStatusData]
  );
  const consumedTableRows = useMemo(
    () => generateConsumedRows(modelStatusData),
    [modelStatusData]
  );

  const offersTableRows = useMemo(
    () => generateOffersRows(modelStatusData, panelRowClick, query?.entity),
    [modelStatusData, panelRowClick, query]
  );
  const appOffersRows = useMemo(
    () => generateAppOffersRows(modelStatusData, panelRowClick, query),
    [modelStatusData, panelRowClick, query]
  );
  const cloudProvider = modelStatusData
    ? extractCloudName(modelStatusData.model["cloud-tag"])
    : "";

  const ModelEntityData = {
    controller: modelStatusData?.model.type,
    "Cloud/Region": `${cloudProvider} / ${modelStatusData?.model.region}`,
    version: modelStatusData?.model.version,
    sla: modelStatusData?.model.sla,
    provider: modelStatusData?.info?.["provider-type"],
  };

  const LocalAppChips = renderCounts("localApps", modelStatusData);
  const appOffersChips = renderCounts("offers", modelStatusData);
  const remoteAppChips = renderCounts("remoteApps", modelStatusData);

  const localAppTableLength = localApplicationTableRows?.length;
  const appOffersTableLength = appOffersRows?.length;
  const remoteAppsTableLength = remoteApplicationTableRows?.length;

  const AppOffersHeader = () => (
    <>
      <span>
        {appOffersTableLength} {pluralize(appOffersTableLength, "Offer")}
      </span>
      <ChipGroup chips={appOffersChips} descriptor={null} />
    </>
  );

  const LocalAppsHeader = () => (
    <>
      <span>
        {localAppTableLength}{" "}
        {pluralize(localAppTableLength, "Local application")}
      </span>
      <ChipGroup chips={LocalAppChips} descriptor={null} />
    </>
  );

  const RemoteAppsHeader = () => (
    <>
      <span>
        {remoteAppsTableLength}{" "}
        {pluralize(remoteAppsTableLength, "Remote application")}
      </span>
      <ChipGroup chips={remoteAppChips} descriptor={null} />
    </>
  );

  const AppOffersTable = () => (
    <>
      {!!appOffersTableLength && (
        <>
          <MainTable
            headers={appsOffersTableHeaders}
            rows={appOffersRows}
            className="entity-details__offers p-main-table"
            sortable
            emptyStateMsg={"There are no offers associated with this model"}
          />
        </>
      )}
    </>
  );

  const LocalAppsTable = () => (
    <>
      {!!localAppTableLength && (
        <MainTable
          headers={localApplicationTableHeaders}
          rows={localApplicationTableRows}
          className="entity-details__apps p-main-table"
          sortable
          emptyStateMsg={"There are no local applications in this model"}
        />
      )}
    </>
  );

  const RemoteAppsTable = () => (
    <>
      {!!remoteAppsTableLength && (
        <MainTable
          headers={remoteApplicationTableHeaders}
          rows={remoteApplicationTableRows}
          className="entity-details__remote-apps p-main-table"
          sortable
          emptyStateMsg={"There are no remote applications in this model"}
        />
      )}
    </>
  );

  const getContentReveals = () => {
    return (
      <>
        {!!appOffersTableLength && (
          <ContentReveal title={AppOffersHeader()} openByDefault={true}>
            {AppOffersTable()}
          </ContentReveal>
        )}

        {!!localAppTableLength && (
          <ContentReveal title={LocalAppsHeader()} openByDefault={true}>
            {LocalAppsTable()}
          </ContentReveal>
        )}

        {!!remoteAppsTableLength && (
          <ContentReveal title={RemoteAppsHeader()} openByDefault={true}>
            {RemoteAppsTable()}
          </ContentReveal>
        )}
      </>
    );
  };

  const countVisibleTables = (tablesLengths) => {
    let numberOfTables = 0;
    tablesLengths.forEach((tableLength) => {
      tableLength > 0 && numberOfTables++;
    });
    return numberOfTables;
  };

  const visibleTables = countVisibleTables([
    localAppTableLength,
    remoteAppsTableLength,
    appOffersTableLength,
  ]);

  const setPanelQs = useQueryParam("panel", StringParam)[1];

  return (
    <EntityDetails type="model">
      <div>
        <InfoPanel />
        <div className="entity-details__actions">
          <button
            className="entity-details__action-button"
            data-test="model-access-btn"
            onClick={() => setPanelQs("share-model")}
          >
            <i className="p-icon--share"></i>Model access
          </button>
        </div>
        {modelStatusData && <EntityInfo data={ModelEntityData} />}
      </div>
      <div className="entity-details__main u-overflow--scroll">
        {shouldShow("apps", query.activeView) && (
          <>
            {visibleTables === 0 && (
              <span>
                There are no applications associated with this model. Learn
                about{" "}
                <a
                  className="p-link--external"
                  href="https://juju.is/docs/deploying-applications"
                >
                  deploying applications
                </a>
              </span>
            )}
            {visibleTables > 1 ? (
              getContentReveals()
            ) : (
              <>
                {LocalAppsTable()}
                {AppOffersTable()}
                {RemoteAppsTable()}
              </>
            )}
          </>
        )}
        {shouldShow("machines", query.activeView) &&
          machinesTableRows.length > 0 && (
            <MainTable
              headers={machineTableHeaders}
              rows={machinesTableRows}
              className="entity-details__machines p-main-table"
              sortable
              emptyStateMsg={"There are no machines in this model"}
            />
          )}
        {shouldShow("integrations", query.activeView) &&
        relationTableRows.length > 0 ? (
          <>
            {shouldShow("relations-title", query.activeView) && (
              <h5>Relations ({relationTableRows.length})</h5>
            )}
            <MainTable
              headers={relationTableHeaders}
              rows={relationTableRows}
              className="entity-details__relations p-main-table"
              sortable
              emptyStateMsg={"There are no relations in this model"}
            />
            {shouldShow("relations-title", query.activeView) && (
              <>
                {consumedTableRows.length > 0 ||
                  (offersTableRows.length > 0 && (
                    <h5>
                      Cross-model relations (
                      {consumedTableRows.length + offersTableRows.length})
                    </h5>
                  ))}
              </>
            )}
            {consumedTableRows.length > 0 && (
              <MainTable
                headers={consumedTableHeaders}
                rows={consumedTableRows}
                className="entity-details__relations p-main-table"
                sortable
                emptyStateMsg={"There are no remote relations in this model"}
              />
            )}
            {offersTableRows.length > 0 && (
              <MainTable
                headers={offersTableHeaders}
                rows={offersTableRows}
                className="entity-details__relations p-main-table"
                sortable
                emptyStateMsg={"There are no connected offers in this model"}
              />
            )}
          </>
        ) : (
          <>
            {query.activeView === "integrations" && (
              <span data-testid="no-integrations-msg">
                There are no integrations associated with this model -{" "}
                <a
                  className="p-link--external"
                  href="https://juju.is/integration"
                >
                  learn more about integration
                </a>
              </span>
            )}
          </>
        )}
        {shouldShow("action-logs", query.activeView) && <ActionLogs />}
      </div>
    </EntityDetails>
  );
};

export default Model;
