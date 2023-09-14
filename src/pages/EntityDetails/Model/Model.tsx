import { Button, Icon, MainTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import EntityInfo from "components/EntityInfo/EntityInfo";
import InfoPanel from "components/InfoPanel/InfoPanel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import useCanConfigureModel from "hooks/useCanConfigureModel";
import useModelStatus from "hooks/useModelStatus";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getModelAccess,
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelRelations,
  getModelUnits,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { extractCloudName } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
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

import ApplicationsTab from "./ApplicationsTab/ApplicationsTab";
import Logs from "./Logs";

export enum Label {
  ACCESS_BUTTON = "Model access",
}

export enum TestId {
  CONSUMED = "consumed",
  OFFERS = "offers",
}

const shouldShow = (segment: string, activeView: string) => {
  switch (activeView) {
    case "apps":
      if (segment === "apps") {
        return true;
      }
      return false;
    case "machines":
    case "integrations":
    case "logs":
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
  }>({
    panel: null,
    entity: null,
    activeView: "apps",
  });

  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const relations = useSelector(getModelRelations(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const canConfigureModel = useCanConfigureModel();

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

  return (
    <>
      <div>
        {/* The sidebar needs to be within a wrapping div so that it does not
            get given the full height of the grid so that the sidebar can be sticky.
        */}
        <div className="entity-details__sidebar">
          <InfoPanel />
          {canConfigureModel && (
            <div className="entity-details__actions">
              <Button
                className="entity-details__action-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setQuery({ panel: "share-model" }, { replace: true });
                }}
              >
                <Icon name="share" />
                {Label.ACCESS_BUTTON}
              </Button>
            </div>
          )}
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
        {shouldShow("apps", query.activeView) && <ApplicationsTab />}
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
                data-testid={TestId.CONSUMED}
                headers={consumedTableHeaders}
                rows={consumedTableRows}
                className="entity-details__relations p-main-table"
                sortable
                emptyStateMsg={"There are no remote relations in this model"}
              />
            )}
            {offersTableRows.length > 0 && (
              <MainTable
                data-testid={TestId.OFFERS}
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
        {shouldShow("logs", query.activeView) && <Logs />}
      </div>
    </>
  );
};

export default Model;
