import { MainTable } from "@canonical/react-components";
import {
  canAdministerModelAccess,
  extractCloudName,
  pluralize,
} from "app/utils/utils";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  StringParam,
  useQueryParam,
  useQueryParams,
  withDefault,
} from "use-query-params";

import {
  appsOffersTableHeaders,
  consumedTableHeaders,
  localApplicationTableHeaders,
  machineTableHeaders,
  offersTableHeaders,
  relationTableHeaders,
  remoteApplicationTableHeaders,
} from "tables/tableHeaders";

import {
  generateAppOffersRows,
  generateConsumedRows,
  generateLocalApplicationRows,
  generateMachineRows,
  generateOffersRows,
  generateRelationRows,
  generateRemoteApplicationRows,
} from "tables/tableRows";

import ContentReveal from "components/ContentReveal/ContentReveal";
import InfoPanel from "components/InfoPanel/InfoPanel";

import EntityInfo from "components/EntityInfo/EntityInfo";
import EntityDetails from "pages/EntityDetails/EntityDetails";
import ActionLogs from "pages/EntityDetails/Model/ActionLogs/ActionLogs";

import useActiveUser from "hooks/useActiveUser";
import useModelStatus from "hooks/useModelStatus";
import useTableRowClick from "hooks/useTableRowClick";

import ChipGroup from "components/ChipGroup/ChipGroup";

import {
  getAllModelApplicationStatus,
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelRelations,
  getModelUnits,
  getModelUUID,
} from "juju/model-selectors";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { TSFixMe } from "types";

import { renderCounts } from "../counts";

export enum Label {
  ACCESS_BUTTON = "Model access",
}

const shouldShow = (segment: string, activeView: string) => {
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

const generateCloudAndRegion = (cloudTag: string, region: string) => {
  if (cloudTag && region) {
    return `${extractCloudName(cloudTag)} / ${region}`;
  }
  return "";
};

const Model = () => {
  const modelStatusData: TSFixMe = useModelStatus();
  const activeUser = useActiveUser();
  const navigate = useNavigate();

  const { userName, modelName } = useParams<EntityDetailsRoute>();

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });

  const modelUUID = useSelector(getModelUUID(modelName, userName));

  const tableRowClick = useTableRowClick();

  const panelRowClick = useCallback(
    (entityName: string, entityPanel: string) => {
      // This can be removed when all entities are moved to top level aside panels
      if (entityPanel === "apps") {
        navigate(`/models/${userName}/${modelName}/app/${entityName}`);
      } else {
        return setQuery({ panel: entityPanel, entity: entityName });
      }
    },
    [setQuery, navigate, modelName, userName]
  );

  const applications = useSelector(getModelApplications(modelUUID));
  const relations = useSelector(getModelRelations(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));

  const applicationStatuses = useSelector(
    getAllModelApplicationStatus(modelUUID)
  );

  const localApplicationTableRows = useMemo(() => {
    return generateLocalApplicationRows(
      applications,
      applicationStatuses,
      tableRowClick,
      query
    );
  }, [applications, applicationStatuses, tableRowClick, query]);

  const remoteApplicationTableRows = useMemo(() => {
    return generateRemoteApplicationRows(modelStatusData, panelRowClick, query);
  }, [modelStatusData, panelRowClick, query]);

  const machinesTableRows = useMemo(() => {
    return generateMachineRows(machines, units, tableRowClick, query?.entity);
  }, [machines, units, tableRowClick, query]);

  const relationTableRows = useMemo(
    () => generateRelationRows(relations, applications),
    [applications, relations]
  );
  const consumedTableRows = useMemo(
    () => generateConsumedRows(modelStatusData),
    [modelStatusData]
  );

  const offersTableRows = useMemo(
    () => generateOffersRows(modelStatusData),
    [modelStatusData]
  );
  const appOffersRows = useMemo(
    () => generateAppOffersRows(modelStatusData, panelRowClick, query),
    [modelStatusData, panelRowClick, query]
  );

  const modelInfoData = useSelector(getModelInfo(modelUUID));

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

  const countVisibleTables = (tablesLengths: number[]) => {
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
          {canAdministerModelAccess(
            activeUser,
            modelStatusData?.info?.users
          ) && (
            <button
              className="entity-details__action-button"
              onClick={() => setPanelQs("share-model")}
            >
              <i className="p-icon--share"></i>
              {Label.ACCESS_BUTTON}
            </button>
          )}
        </div>
        {modelInfoData && (
          <EntityInfo
            data={{
              controller: modelInfoData.type,
              "Cloud/Region": generateCloudAndRegion(
                modelInfoData["cloud-tag"],
                modelInfoData.region
              ),
              version: modelInfoData.version,
              sla: modelInfoData.sla?.level,
            }}
          />
        )}
      </div>
      <div className="entity-details__main u-overflow--auto">
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
          (machinesTableRows.length > 0 ? (
            <MainTable
              headers={machineTableHeaders}
              rows={machinesTableRows}
              className="entity-details__machines p-main-table"
              sortable
            />
          ) : (
            <span data-testid="no-machines-msg">
              There are no machines in this model -{" "}
              <a
                className="p-link--external"
                href="https://juju.is/docs/olm/machines"
              >
                learn more about machines
              </a>
            </span>
          ))}
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
