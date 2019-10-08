import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import MainTable from "components/MainTable/MainTable";
import Terminal from "components/Terminal/Terminal";

import { getModelUUID, getModelStatus } from "app/selectors";
import { fetchModelStatus } from "juju/actions";

import "./_model-details.scss";

const applicationTableHeaders = [
  { content: "app" },
  { content: "status" },
  { content: "version" },
  { content: "scale", className: "u-align--right" },
  { content: "store" },
  { content: "rev", className: "u-align--right" },
  { content: "os" },
  { content: "notes" }
];

const unitTableHeaders = [
  { content: "unit" },
  { content: "workload" },
  { content: "agent" },
  { content: "machine" },
  { content: "public address" },
  { content: "port" },
  { content: "message" }
];

const generateApplicationRows = modelStatusData => {
  if (!modelStatusData) {
    return [];
  }

  const applications = modelStatusData.applications;
  return Object.keys(applications).map(key => {
    const app = applications[key];
    return {
      columns: [
        { content: key },
        { content: app.status ? app.status.status : "-" },
        { content: "-" },
        { content: "CharmHub" },
        { content: key.split("-")[-1] },
        { content: "-" },
        { content: "-" }
      ]
    };
  });
};

const generateUnitRows = modelStatusData => {
  if (!modelStatusData) {
    return [];
  }

  const applications = modelStatusData.applications;
  const unitRows = [];
  Object.keys(applications).forEach(applicationName => {
    const units = applications[applicationName].units || [];
    Object.keys(units).forEach(unitId => {
      const unit = units[unitId];
      unitRows.push({
        columns: [
          { content: unitId },
          { content: unit.workloadStatus.status },
          { content: unit.agentStatus.status },
          { content: unit.machine },
          { content: unit.publicAddress },
          { content: unit.publicAddress.split(":")[-1] },
          { content: unit.workloadStatus.info }
        ]
      });
    });
  });
  return unitRows;
};

const ModelDetails = () => {
  const { 0: modelName } = useParams();
  const dispatch = useDispatch();

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID
  ]);
  const modelStatusData = useSelector(getModelStatusMemo);

  useEffect(() => {
    if (modelUUID !== null && modelStatusData === null) {
      // This model may not be in the first batch of models that we request
      // status from in the main loop so request for it now.
      dispatch(fetchModelStatus(modelUUID));
    }
  }, [dispatch, modelUUID, modelStatusData]);

  const viewFilters = ["all", "apps", "units", "machines", "relations"];
  const statusFilters = ["all", "maintenance", "blocked"];
  const applicationTableRows = useMemo(
    () => generateApplicationRows(modelStatusData),
    [modelStatusData]
  );
  const unitTableRows = useMemo(() => generateUnitRows(modelStatusData), [
    modelStatusData
  ]);

  return (
    <Layout sidebar={false}>
      <div className="model-details">
        <InfoPanel />
        <div className="model-details__main">
          <div className="model-details__filters">
            <Filter label="View" filters={viewFilters} />
            <Filter label="Status" filters={statusFilters} />
          </div>
          <MainTable
            headers={applicationTableHeaders}
            rows={applicationTableRows}
            sortable
          />
          <MainTable headers={unitTableHeaders} rows={unitTableRows} sortable />
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
