import React, { useEffect, useMemo, useState } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import cloneDeep from "clone-deep";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import SlidePanel from "components/SlidePanel/SlidePanel";

import { getConfig, getModelUUID, getModelStatus } from "app/selectors";
import { fetchModelStatus } from "juju/actions";
import { collapsibleSidebar } from "ui/actions";

import {
  applicationTableHeaders,
  unitTableHeaders,
  machineTableHeaders,
  relationTableHeaders,
  generateApplicationRows,
  generateMachineRows,
  generateRelationRows,
  generateUnitRows,
  generateAppSlidePanel,
} from "./generators";

import "./_model-details.scss";

/**
  Returns the modelStatusData filtered by the supplied values.
  @param {Object} modelStatusData The model status data to filter
  @param {String} appName The name of the application to filter the data by.
*/
const filterModelStatusData = (modelStatusData, appName) => {
  if (modelStatusData) {
    const filteredData = cloneDeep(modelStatusData);
    Object.keys(filteredData.applications).forEach((key) => {
      filteredData.applications[key].unitsCount = Object.keys(
        filteredData.applications[key].units
      ).length;
    });
    if (appName === "") {
      return filteredData;
    }

    const application = filteredData.applications[appName];
    // remove the units from the application objects that are not
    // the filter-by app.
    const subordinateTo = application.subordinateTo || [];
    Object.keys(filteredData.applications).forEach((key) => {
      if (key !== appName && !subordinateTo.includes(key)) {
        filteredData.applications[key].units = {};
      }
    });
    // Loop through all of the units of the remaining applications that are
    // listed in the subordinateTo list. This is done because although
    // a subordinate is supposed to be installed on each unit, that's not
    // always the case.
    subordinateTo.forEach((parentName) => {
      const units = filteredData.applications[parentName].units;
      Object.entries(units).forEach((entry) => {
        const found = Object.entries(entry[1].subordinates).find(
          (ele) => ele[0].split("/")[0] === appName
        );
        if (!found) {
          delete units[entry[0]];
        }
      });
    });

    // Remove all the machines that the selected application isn't installed on.
    const appMachines = new Set();
    for (let unitId in application.units) {
      const unit = application.units[unitId];
      appMachines.add(unit.machine);
    }
    subordinateTo.forEach((subAppName) => {
      // this will be the parent of the subordinate and grab the machines from it
      const parent = filteredData.applications[subAppName];
      for (let unitId in parent.units) {
        const unit = parent.units[unitId];
        appMachines.add(unit.machine);
      }
    });
    for (let machineId in filteredData.machines) {
      if (!appMachines.has(machineId)) delete filteredData.machines[machineId];
    }

    // Remove all relations that don't involve the selected application.
    filteredData.relations = modelStatusData.relations.filter(
      (relation) => relation.key.indexOf(appName) > -1
    );

    return filteredData;
  }

  return modelStatusData;
};

const ModelDetails = () => {
  const { 0: modelName } = useParams();
  const dispatch = useDispatch();
  const [filterByApp, setFilterByApp] = useState("");

  const [viewFilterToggle, setViewFilterToggle] = useState({ all: true });

  const [slidePanelData, setSlidePanelData] = useState({});

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID,
  ]);
  const modelStatusData = useSelector(getModelStatusMemo);
  const filteredModelStatusData = filterModelStatusData(
    modelStatusData,
    filterByApp
  );

  const { baseAppURL } = useSelector(getConfig);

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

  const handleAppRowClick = (e, app) => {
    console.log(app);
    setSlidePanelData({ app });
    setFilterByApp(e.currentTarget.dataset.app);
  };

  const viewFilters = ["all", "apps", "units", "machines", "relations"];

  const applicationTableRows = useMemo(
    () =>
      generateApplicationRows(modelStatusData, handleAppRowClick, baseAppURL),
    [baseAppURL, modelStatusData]
  );

  const unitTableRows = useMemo(
    () => generateUnitRows(modelStatusData, baseAppURL),
    [baseAppURL, modelStatusData]
  );
  const unitSlidePanelRows = useMemo(
    () => generateUnitRows(filteredModelStatusData, baseAppURL),
    [baseAppURL, filteredModelStatusData]
  );

  const machinesTableRows = useMemo(
    () => generateMachineRows(modelStatusData),
    [modelStatusData]
  );
  const machinesSlidePanelRows = useMemo(
    () => generateMachineRows(filteredModelStatusData),
    [filteredModelStatusData]
  );

  const relationTableRows = useMemo(
    () => generateRelationRows(modelStatusData, baseAppURL),
    [modelStatusData, baseAppURL]
  );
  const relationSlidePanelRows = useMemo(
    () => generateRelationRows(filteredModelStatusData, baseAppURL),
    [filteredModelStatusData, baseAppURL]
  );

  const appSlidePanel = useMemo(
    () => generateAppSlidePanel(slidePanelData.app),
    [slidePanelData.app]
  );

  const slidePanelActive = Object.entries(slidePanelData).length > 0;

  return (
    <Layout>
      <Header>
        <div className="model-details__header">
          <strong className="model-details__title">
            {modelStatusData ? modelStatusData.model.name : "..."}
          </strong>
          <div className="model-details__filters">
            <Filter
              label="View:"
              filters={viewFilters}
              setFilterToggle={setViewFilterToggle}
              filterToggle={viewFilterToggle}
              disabled={slidePanelActive}
            />
          </div>
        </div>
      </Header>
      <div className="l-content">
        <div className="model-details" aria-disabled={slidePanelActive}>
          <InfoPanel />
          <div className="model-details__main u-overflow--scroll">
            {(viewFilterToggle.all || viewFilterToggle.apps) && (
              <MainTable
                headers={applicationTableHeaders}
                rows={applicationTableRows}
                className="model-details__apps p-main-table"
                sortable
                emptyStateMsg={"There are no applications in this model"}
              />
            )}
            {(viewFilterToggle.all || viewFilterToggle.units) && (
              <MainTable
                headers={unitTableHeaders}
                rows={unitTableRows}
                className="model-details__units p-main-table"
                sortable
                emptyStateMsg={"There are no units in this model"}
              />
            )}
            {(viewFilterToggle.all || viewFilterToggle.machines) && (
              <MainTable
                headers={machineTableHeaders}
                rows={machinesTableRows}
                className="model-details__machines p-main-table"
                sortable
                emptyStateMsg={"There are no machines in this model"}
              />
            )}
            {(viewFilterToggle.all || viewFilterToggle.relations) && (
              <MainTable
                headers={relationTableHeaders}
                rows={relationTableRows}
                className="model-details__relations p-main-table"
                sortable
                emptyStateMsg={"There are no relations in this model"}
              />
            )}
          </div>
        </div>
        <SlidePanel
          isActive={slidePanelActive}
          onClose={() => setSlidePanelData({})}
        >
          <div style={{ maxWidth: "75vw" }}>
            {appSlidePanel}
            <MainTable
              headers={unitTableHeaders}
              rows={unitSlidePanelRows}
              className="model-details__units p-main-table"
              sortable
              emptyStateMsg={"There are no units in this model"}
            />
            <MainTable
              headers={machineTableHeaders}
              rows={machinesSlidePanelRows}
              className="model-details__machines p-main-table"
              sortable
              emptyStateMsg={"There are no machines in this model"}
            />
            <MainTable
              headers={relationTableHeaders}
              rows={relationSlidePanelRows}
              className="model-details__relations p-main-table"
              sortable
              emptyStateMsg={"There are no relations in this model"}
            />
          </div>
        </SlidePanel>
      </div>
    </Layout>
  );
};

export default ModelDetails;
