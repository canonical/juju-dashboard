import React, { useEffect, useMemo, useState } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import cloneDeep from "clone-deep";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import Terminal from "components/Terminal/Terminal";
import Header from "components/Header/Header";

import { getModelUUID, getModelStatus } from "app/selectors";
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
} from "./generators";

import "./_model-details.scss";

/**
  Returns the modelStatusData filtered by the supplied values.
  @param {Object} modelStatusData The model status data to filter
  @param {String} appName The name of the application to filter the data by.
*/
const filterModelStatusData = (modelStatusData, appName) => {
  if (!modelStatusData || appName === "") {
    return modelStatusData;
  }
  const filteredData = cloneDeep(modelStatusData);
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
};

const ModelDetails = () => {
  const { 0: modelName } = useParams();
  const dispatch = useDispatch();
  const [filterByApp, setFilterByApp] = useState("");

  const [viewFilterToggle, setViewFilterToggle] = useState({ all: true });

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

  useEffect(() => {
    dispatch(collapsibleSidebar(true));
    return () => {
      dispatch(collapsibleSidebar(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (modelUUID !== null && filteredModelStatusData === null) {
      // This model may not be in the first batch of models that we request
      // status from in the main loop so update the status now.
      dispatch(fetchModelStatus(modelUUID));
    }
  }, [dispatch, modelUUID, filteredModelStatusData]);

  const handleRowClick = (e) => {
    const currentTarget = e.currentTarget;
    if (currentTarget.classList.contains("is-selected")) {
      setFilterByApp("");
      return;
    }
    setFilterByApp(currentTarget.dataset.app);
  };

  const viewFilters = ["all", "apps", "units", "machines", "relations"];

  const applicationTableRows = useMemo(
    () =>
      generateApplicationRows(
        filteredModelStatusData,
        filterByApp,
        handleRowClick
      ),
    [filterByApp, filteredModelStatusData]
  );
  const unitTableRows = useMemo(
    () => generateUnitRows(filteredModelStatusData, filterByApp),
    [filterByApp, filteredModelStatusData]
  );
  const machinesTableRows = useMemo(
    () => generateMachineRows(filteredModelStatusData, filterByApp),
    [filterByApp, filteredModelStatusData]
  );
  const relationTableRows = useMemo(
    () => generateRelationRows(filteredModelStatusData, filterByApp),
    [filterByApp, filteredModelStatusData]
  );

  return (
    <Layout>
      <Header>
        <div className="model-details__header">
          <div className="model-details__title">
            {modelStatusData ? modelStatusData.model.name : "..."}
          </div>
          <div className="model-details__filters">
            <Filter
              label="View:"
              filters={viewFilters}
              setFilterToggle={setViewFilterToggle}
              filterToggle={viewFilterToggle}
            />
          </div>
        </div>
      </Header>
      <div className="l-content">
        <div className="model-details">
          <InfoPanel />
          <div className="model-details__main u-overflow--scroll">
            {(viewFilterToggle.all === true ||
              viewFilterToggle.apps === true) && (
              <MainTable
                headers={applicationTableHeaders}
                rows={applicationTableRows}
                className="model-details__apps"
                sortable
              />
            )}
            {(viewFilterToggle.all === true ||
              viewFilterToggle.units === true) && (
              <MainTable
                headers={unitTableHeaders}
                rows={unitTableRows}
                className="model-details__units"
                sortable
              />
            )}
            {(viewFilterToggle.all === true ||
              viewFilterToggle.machines === true) && (
              <MainTable
                headers={machineTableHeaders}
                rows={machinesTableRows}
                className="model-details__machines"
                sortable
              />
            )}
            {(viewFilterToggle.all === true ||
              viewFilterToggle.relations === true) && (
              <MainTable
                headers={relationTableHeaders}
                rows={relationTableRows}
                className="model-details__relations"
                sortable
              />
            )}
          </div>
        </div>
      </div>
      <Terminal
        address="wss://shell.jujugui.org:443/ws/"
        modelName={modelName}
      />
    </Layout>
  );
};

export default ModelDetails;
