import { MainTable } from "@canonical/react-components";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  canAdministerModelAccess,
  extractCloudName,
} from "store/juju/utils/models";

import {
  consumedTableHeaders,
  machineTableHeaders,
  offersTableHeaders,
  relationTableHeaders,
} from "tables/tableHeaders";

import {
  generateConsumedRows,
  generateMachineRows,
  generateOffersRows,
  generateRelationRows,
} from "tables/tableRows";

import InfoPanel from "components/InfoPanel/InfoPanel";

import EntityInfo from "components/EntityInfo/EntityInfo";
import ActionLogs from "pages/EntityDetails/Model/ActionLogs/ActionLogs";

import useModelStatus from "hooks/useModelStatus";
import { useQueryParams } from "hooks/useQueryParams";

import {
  getActiveUser,
  getModelAccess,
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelRelations,
  getModelUnits,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import ApplicationsTab from "./ApplicationsTab/ApplicationsTab";

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

const generateCloudAndRegion = (cloudTag: string, region?: string) => {
  if (cloudTag && region) {
    return `${extractCloudName(cloudTag)} / ${region}`;
  }
  return "";
};

const Model = () => {
  const modelStatusData = useModelStatus();

  const { userName, modelName } = useParams<EntityDetailsRoute>();

  const [query, setQuery] = useQueryParams<{
    entity: string | null;
    panel: string | null;
    activeView: string;
    filterQuery: string;
  }>({
    panel: null,
    entity: null,
    activeView: "apps",
    filterQuery: "",
  });

  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const relations = useSelector(getModelRelations(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const activeUser = useAppSelector((state) => getActiveUser(state, modelUUID));

  const machinesTableRows = useMemo(() => {
    return modelName && userName
      ? generateMachineRows(
          machines,
          units,
          { modelName, userName },
          query?.entity
        )
      : [];
  }, [machines, units, modelName, userName, query]);

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

  const modelInfoData = useSelector(getModelInfo(modelUUID));
  const modelAccess = useAppSelector((state) =>
    getModelAccess(state, modelUUID)
  );

  const [applicationsFilterQuery, setApplicationsFilterQuery] =
    useState<string>(query.filterQuery || "");

  useEffect(() => {
    setApplicationsFilterQuery(query.filterQuery);
  }, [query.filterQuery]);

  return (
    <>
      <div>
        {/* The sidebar needs to be within a wrapping div so that it does not
            get given the full height of the grid so that the sidebar can be sticky.
        */}
        <div className="entity-details__sidebar">
          <InfoPanel />
          <div className="entity-details__actions">
            {canAdministerModelAccess(
              activeUser,
              modelStatusData?.info?.users
            ) && (
              <button
                className="entity-details__action-button"
                onClick={() => setQuery({ panel: "share-model" })}
              >
                <i className="p-icon--share"></i>
                {Label.ACCESS_BUTTON}
              </button>
            )}
          </div>
          {modelInfoData && (
            <EntityInfo
              data={{
                access: modelAccess ?? "Unknown",
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
      </div>
      <div className="entity-details__main u-overflow--auto">
        {shouldShow("apps", query.activeView) && (
          <ApplicationsTab filterQuery={applicationsFilterQuery} />
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
    </>
  );
};

export default Model;
