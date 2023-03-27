import { Icon, MainTable } from "@canonical/react-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  canAdministerModelAccess,
  extractCloudName,
} from "store/juju/utils/models";
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

import InfoPanel from "components/InfoPanel/InfoPanel";
import {
  generateConsumedRows,
  generateMachineRows,
  generateOffersRows,
  generateRelationRows,
} from "tables/tableRows";

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
  getModelUUIDFromList,
} from "store/juju/selectors";

import type { EntityDetailsRoute } from "components/Routes/Routes";

import SearchBox from "components/SearchBox/SearchBox";
import ApplicationsTab from "./ApplicationsTab/ApplicationsTab";
import "./_model.scss";

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
type ApplicationsQueryMode = "simple" | "jq" | "SQL";

const ApplicationQueryOption = (props: {
  queryMode: ApplicationsQueryMode;
  mode: ApplicationsQueryMode;
  text?: string;
  onClick: (mode: ApplicationsQueryMode) => void;
}) => {
  if (props.queryMode === props.mode) return null;
  return (
    <button
      className="p-contextual-menu__link"
      onClick={() => props.onClick(props.mode)}
    >
      {props.text || props.mode}
    </button>
  );
};

const SimpleQueryInput = (props: { onSubmit: (query: string) => void }) => {
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const handleFilterSubmit = () => {
    const filterQuery = searchBoxRef.current?.value || "";
    props.onSubmit(filterQuery);
  };
  return (
    <SearchBox
      className="u-no-margin"
      placeholder="Filter applications"
      onKeyDown={(e) => {
        if (e.code === "Enter") handleFilterSubmit();
      }}
      onSearch={handleFilterSubmit}
      onClear={handleFilterSubmit}
      externallyControlled
      ref={searchBoxRef}
      autoComplete="off"
      data-testid="filter-applications"
    />
  );
};
const AdvancedQueryInput = (props: {
  type: "SQL" | "jq";
  onSubmit: (query: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // auto focus when switching to advanced mode
    inputRef.current?.focus();
  }, []);
  const handleFilterSubmit = () => {
    const filterQuery = inputRef.current?.value || "";
    props.onSubmit(filterQuery);
  };

  return (
    <SearchBox
      className="u-no-margin advanced-query-input"
      placeholder={`${props.type} query`}
      onKeyDown={(e) => {
        if (e.code === "Enter") handleFilterSubmit();
      }}
      onSearch={handleFilterSubmit}
      externallyControlled
      ref={inputRef}
      autoComplete="off"
      customSearchIcon={
        <Icon name="run-action" title={`Run the ${props.type} query`} />
      }
      hideClearButton
    />
  );
};
const ApplicationsSimpleSearch = () => {
  const [queryMode, setQueryMode] = useState<ApplicationsQueryMode>("simple");
  const [showContextualMenu, setShowContextualMenu] = useState(false);
  const [, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
    filterQuery: withDefault(StringParam, ""),
  });
  // const isJuju = useSelector(getConfig)?.isJuju || true;
  const isJuju = false;
  const handleFilterSubmit = (filterQuery: string) => {
    setQuery({ filterQuery });
  };

  const handleQueryModeChange = (mode: ApplicationsQueryMode) => {
    setQueryMode(mode);
    setShowContextualMenu(false);
  };

  const queryInput = useMemo(() => {
    if (queryMode === "simple")
      return <SimpleQueryInput onSubmit={handleFilterSubmit} />;
    else {
      // remove the filter query from the URL
      setQuery({ filterQuery: undefined });
      return (
        <AdvancedQueryInput
          key={queryMode}
          type={queryMode}
          onSubmit={(q) =>
            console.log("TODO: use the JIMM facade once implemented", q)
          }
        />
      );
    }
  }, [queryMode]);

  return (
    <span
      className="p-contextual-menu--left"
      // advanced search is only supported in JAAS
      onFocus={() => !isJuju && setShowContextualMenu(true)}
      onBlur={() => !isJuju && setShowContextualMenu(false)}
    >
      {queryInput}
      <div
        className="p-contextual-menu__dropdown"
        aria-hidden="false"
        data-show={showContextualMenu}
      >
        <span className="p-contextual-menu__title">Switch mode to:</span>
        <ApplicationQueryOption
          mode="simple"
          text="Simple"
          queryMode={queryMode}
          onClick={handleQueryModeChange}
        />
        <ApplicationQueryOption
          mode="jq"
          text="Advanced - jq"
          queryMode={queryMode}
          onClick={handleQueryModeChange}
        />
        <ApplicationQueryOption
          mode="SQL"
          text="Advanced - SQL"
          queryMode={queryMode}
          onClick={handleQueryModeChange}
        />
      </div>
    </span>
  );
};
const Model = () => {
  const modelStatusData = useModelStatus();
  const activeUser = useActiveUser();

  const { userName, modelName } = useParams<EntityDetailsRoute>();

  const [query] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
    filterQuery: withDefault(StringParam, ""),
  });

  const tableRowClick = useTableRowClick();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
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
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [applicationsFilterQuery, setApplicationsFilterQuery] =
    useState<string>(query.filterQuery || "");

  useEffect(() => {
    setApplicationsFilterQuery(query.filterQuery);
    // set value
    if (searchBoxRef.current) searchBoxRef.current.value = query.filterQuery;
  }, [query.filterQuery]);

  return (
    <EntityDetails
      type="model"
      additionalHeaderContent={
        shouldShow("apps", query.activeView) ? (
          <ApplicationsSimpleSearch />
        ) : undefined
      }
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
