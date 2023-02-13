import { MainTable } from "@canonical/react-components";
import { canAdministerModelAccess, extractCloudName } from "app/utils/utils";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  StringParam,
  useQueryParam,
  useQueryParams,
  withDefault,
} from "use-query-params";

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
import EntityDetails from "pages/EntityDetails/EntityDetails";
import ActionLogs from "pages/EntityDetails/Model/ActionLogs/ActionLogs";

import useActiveUser from "hooks/useActiveUser";
import useModelStatus from "hooks/useModelStatus";
import useTableRowClick from "hooks/useTableRowClick";

import {
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelRelations,
  getModelUnits,
  getModelUUID,
} from "store/juju/selectors";

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
  const activeUser = useActiveUser();

  const { userName, modelName } = useParams<EntityDetailsRoute>();

  const [query] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });

  const tableRowClick = useTableRowClick();

  const modelUUID = useSelector(getModelUUID(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const relations = useSelector(getModelRelations(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));

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

  const modelInfoData = useSelector(getModelInfo(modelUUID));

  const setPanelQs = useQueryParam("panel", StringParam)[1];
  const [applicationsFilterQuery, setApplicationsFilterQuery] = useState<
    string | undefined
  >();
  return (
    <EntityDetails
      type="model"
      onApplicationsFilter={(q) => setApplicationsFilterQuery(q)}
    >
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
    </EntityDetails>
  );
};

export default Model;
