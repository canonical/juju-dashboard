import React, { useEffect, useMemo } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import Spinner from "@canonical/react-components/dist/components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useQueryParams, StringParam, withDefault } from "use-query-params";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import Counts from "components/Counts/Counts";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import Terminal from "components/Terminal/Terminal";

import AppsPanel from "components/panels/AppsPanel/AppsPanel";
import MachinesPanel from "components/panels/MachinesPanel/MachinesPanel";
import UnitsPanel from "components/panels/UnitsPanel/UnitsPanel";

import {
  getConfig,
  getControllerDataByUUID,
  getModelUUID,
} from "app/selectors";

import useModelStatus from "hooks/useModelStatus";

import { fetchModelStatus } from "juju/actions";
import { collapsibleSidebar } from "ui/actions";

import {
  applicationTableHeaders,
  consumedTableHeaders,
  offersTableHeaders,
  unitTableHeaders,
  machineTableHeaders,
  relationTableHeaders,
  generateApplicationRows,
  generateConsumedRows,
  generateMachineRows,
  generateRelationRows,
  generateOffersRows,
  generateUnitRows,
} from "./generators";

import "./_model-details.scss";

const generateTerminalComponent = (modelUUID, controllerWSHost) => {
  return null; // XXX Remove me to see the Terminal
  /* eslint-disable no-unreachable */
  if (modelUUID && controllerWSHost) {
    return (
      <Terminal
        address={`wss://${controllerWSHost}/model/${modelUUID}/commands`}
      />
    );
  }
  return null;
  /* eslint-enable no-unreachable */
};

const shouldShow = (segment, activeView) => {
  switch (activeView) {
    case "status":
      if (segment === "relations-title") {
        return false;
      }
      return true;
    case "units":
    case "machines":
    case "relations":
      if (segment === "relations-title") {
        return true;
      }
      return segment === activeView;
  }
};

const incrementCounts = (status, counts) => {
  if (counts[status]) {
    counts[status] = counts[status] += 1;
  } else {
    counts[status] = 1;
  }
  return counts;
};

const formatCounts = (counts) =>
  Object.entries(counts).map((statusSet) => ({
    count: statusSet[1],
    label: statusSet[0],
  }));

const generateSecondaryCounts = (modelStatusData, segment, selector) => {
  return formatCounts(
    Object.entries(modelStatusData[segment]).reduce((counts, section) => {
      const status = section[1][selector].status;
      return incrementCounts(status, counts);
    }, {})
  );
};

const generateUnitSecondaryCounts = (modelStatusData) => {
  const counts = {};
  let totalUnits = 0;
  const applications = modelStatusData.applications;
  Object.keys(applications).forEach((applicationName) => {
    const units = applications[applicationName].units || [];
    Object.keys(units).forEach((unitId) => {
      const status = units[unitId].agentStatus.status;
      totalUnits += 1;
      return incrementCounts(status, counts);
    });
  });
  return [formatCounts(counts), totalUnits];
};

const renderCounts = (activeView, modelStatusData) => {
  if (!modelStatusData) return null;
  let primaryEntity = null;
  let secondaryEntities = null;
  switch (activeView) {
    case "status":
      primaryEntity = {
        count: Object.keys(modelStatusData?.applications).length,
        label: "application",
      };
      secondaryEntities = generateSecondaryCounts(
        modelStatusData,
        "applications",
        "status"
      );
      break;
    case "units":
      let totalUnits;
      [secondaryEntities, totalUnits] = generateUnitSecondaryCounts(
        modelStatusData
      );
      primaryEntity = {
        count: totalUnits,
        label: "unit",
      };
      break;
    case "machines":
      primaryEntity = {
        count: Object.keys(modelStatusData.machines).length,
        label: "machine",
      };
      secondaryEntities = generateSecondaryCounts(
        modelStatusData,
        "machines",
        "agentStatus"
      );
      break;
    case "relations":
      return null;
  }

  return (
    <Counts
      primaryEntity={primaryEntity}
      secondaryEntities={secondaryEntities}
    />
  );
};

const ModelDetails = () => {
  const { 0: modelName } = useParams();
  const dispatch = useDispatch();

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const modelStatusData = useModelStatus();

  const controllerUUID = modelStatusData?.info.controllerUuid;
  const controllerData = useSelector(getControllerDataByUUID(controllerUUID));
  let controllerWSHost = "";
  if (controllerData) {
    controllerWSHost = controllerData[0]
      .replace("wss://", "")
      .replace("/api", "");
  }

  const { baseAppURL } = useSelector(getConfig);

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "status"),
  });

  const setActiveView = (view) => {
    setQuery({ activeView: view });
  };

  useEffect(() => {
    dispatch(collapsibleSidebar(true));
    return () => {
      dispatch(collapsibleSidebar(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (modelUUID !== null && modelStatusData === null) {
      // This model may not be in the first batch of models that we request
      // status from in the main loop so update the status now.
      dispatch(fetchModelStatus(modelUUID));
    }
  }, [dispatch, modelUUID, modelStatusData]);

  const applicationTableRows = useMemo(() => {
    const handleAppRowClick = (e) => {
      setQuery({ panel: "apps", entity: e.currentTarget.dataset.app });
    };
    return generateApplicationRows(
      modelStatusData,
      handleAppRowClick,
      baseAppURL,
      query?.entity
    );
  }, [baseAppURL, modelStatusData, setQuery, query]);

  const unitTableRows = useMemo(() => {
    const handleUnitsRowClick = (e) => {
      setQuery({
        panel: "units",
        entity: e.currentTarget.dataset.unit,
      });
    };
    return generateUnitRows(
      modelStatusData,
      handleUnitsRowClick,
      baseAppURL,
      query?.entity
    );
  }, [baseAppURL, modelStatusData, query, setQuery]);

  const machinesTableRows = useMemo(() => {
    const handleMachineRowClick = (e) => {
      setQuery({ panel: "machines", entity: e.currentTarget.dataset.machine });
    };
    return generateMachineRows(
      modelStatusData,
      handleMachineRowClick,
      query?.entity
    );
  }, [modelStatusData, setQuery, query]);

  const relationTableRows = useMemo(
    () => generateRelationRows(modelStatusData, baseAppURL),
    [modelStatusData, baseAppURL]
  );

  const consumedTableRows = useMemo(
    () => generateConsumedRows(modelStatusData, baseAppURL),
    [modelStatusData, baseAppURL]
  );
  const offersTableRows = useMemo(
    () => generateOffersRows(modelStatusData, baseAppURL),
    [modelStatusData, baseAppURL]
  );

  const { panel: activePanel, entity, activeView } = query;
  const closePanelConfig = { panel: undefined, entity: undefined };

  const panelRowClick = (e, entityName, entityPanel) => {
    return setQuery({ panel: entityPanel, entity: entityName });
  };

  return (
    <Layout>
      <Header>
        <div className="model-details__header">
          <strong className="model-details__title">
            {modelStatusData ? modelStatusData.model.name : "..."}
          </strong>
          <div className="model-details__view-selector">
            {modelStatusData && (
              <ButtonGroup
                buttons={["status", "units", "machines", "relations"]}
                label="View:"
                activeButton={activeView}
                setActiveButton={setActiveView}
              />
            )}
          </div>
        </div>
      </Header>
      {!modelStatusData ? (
        <div className="model-details__loading">
          <Spinner />
        </div>
      ) : (
        <div className="l-content">
          <div className="model-details">
            <InfoPanel />
            <div className="model-details__main u-overflow--scroll">
              {renderCounts(activeView, modelStatusData)}
              {shouldShow("apps", activeView) &&
                applicationTableRows.length > 0 && (
                  <MainTable
                    headers={applicationTableHeaders}
                    rows={applicationTableRows}
                    className="model-details__apps p-main-table"
                    sortable
                    emptyStateMsg={"There are no applications in this model"}
                  />
                )}
              {shouldShow("units", activeView) && unitTableRows.length > 0 && (
                <MainTable
                  headers={unitTableHeaders}
                  rows={unitTableRows}
                  className="model-details__units p-main-table"
                  sortable
                  emptyStateMsg={"There are no units in this model"}
                />
              )}
              {shouldShow("machines", activeView) &&
                machinesTableRows.length > 0 && (
                  <MainTable
                    headers={machineTableHeaders}
                    rows={machinesTableRows}
                    className="model-details__machines p-main-table"
                    sortable
                    emptyStateMsg={"There are no machines in this model"}
                  />
                )}
              {shouldShow("relations", activeView) &&
                relationTableRows.length > 0 && (
                  <>
                    {shouldShow("relations-title", activeView) && (
                      <h5>Relations ({relationTableRows.length})</h5>
                    )}
                    <MainTable
                      headers={relationTableHeaders}
                      rows={relationTableRows}
                      className="model-details__relations p-main-table"
                      sortable
                      emptyStateMsg={"There are no relations in this model"}
                    />
                    {shouldShow("relations-title", activeView) && (
                      <h5>
                        Cross-model relations (
                        {consumedTableRows.length + offersTableRows.length})
                      </h5>
                    )}
                    {consumedTableRows.length ? (
                      <MainTable
                        headers={consumedTableHeaders}
                        rows={consumedTableRows}
                        className="model-details__relations p-main-table"
                        sortable
                        emptyStateMsg={
                          "There are no remote relations in this model"
                        }
                      />
                    ) : null}
                    {offersTableRows.length ? (
                      <MainTable
                        headers={offersTableHeaders}
                        rows={offersTableRows}
                        className="model-details__relations p-main-table"
                        sortable
                        emptyStateMsg={
                          "There are no connected offers in this model"
                        }
                      />
                    ) : null}
                  </>
                )}
            </div>
          </div>
          <AppsPanel
            entity={entity}
            isActive={activePanel === "apps"}
            onClose={() => setQuery(closePanelConfig)}
            panelRowClick={panelRowClick}
          />
          <MachinesPanel
            entity={entity}
            isActive={activePanel === "machines"}
            onClose={() => setQuery(closePanelConfig)}
            panelRowClick={panelRowClick}
          />
          <UnitsPanel
            entity={entity}
            isActive={activePanel === "units"}
            onClose={() => setQuery(closePanelConfig)}
            panelRowClick={panelRowClick}
          />
        </div>
      )}
      {generateTerminalComponent(modelUUID, controllerWSHost)}
    </Layout>
  );
};

export default ModelDetails;
