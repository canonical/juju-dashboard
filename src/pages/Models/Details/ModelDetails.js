import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import MainTable from "components/MainTable/MainTable";
import Terminal from "components/Terminal/Terminal";
import Header from "components/Header/Header";
import UserIcon from "components/UserIcon/UserIcon";

import { getModelUUID, getModelStatus } from "app/selectors";
import { fetchModelStatus } from "juju/actions";
import { collapsibleSidebar } from "app/actions";
import { generateStatusIcon } from "app/utils";

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

const relationTableHeaders = [
  { content: "relation provider" },
  { content: "requirer" },
  { content: "interface" },
  { content: "type" },
  { content: "message" }
];

const generateEntityLink = (namespace, href, name) => {
  return (
    <>
      {namespace && (
        <img
          alt=""
          width="24"
          height="24"
          className="entity-icon"
          src={`https://api.jujucharms.com/charmstore/v5/${namespace}/icon.svg`}
        />
      )}
      <a href={href}>{name}</a>
    </>
  );
};

const generateApplicationRows = modelStatusData => {
  if (!modelStatusData) {
    return [];
  }

  const applications = modelStatusData.applications;

  return Object.keys(applications).map(key => {
    const app = applications[key];

    return {
      columns: [
        {
          content: generateEntityLink(
            app.charm ? app.charm.replace("cs:", "") : "",
            "#",
            key
          )
        },
        { content: app.status ? generateStatusIcon(app.status.status) : "-" },
        { content: "-" },
        { content: "CharmHub" },
        { content: key.split("-")[-1] },
        { content: "-" },
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
          {
            content: generateEntityLink(
              applications[applicationName].charm
                ? applications[applicationName].charm.replace("cs:", "")
                : "",
              "#",
              unitId
            )
          },
          { content: generateStatusIcon(unit.workloadStatus.status) },
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

const extractRelationEndpoints = relation => {
  const endpoints = {};
  relation.endpoints.forEach(endpoint => {
    endpoints[endpoint.role] = endpoint.application + ":" + endpoint.name;
  });
  return endpoints;
};

const generateRelationRows = modelStatusData => {
  if (!modelStatusData) {
    return [];
  }

  const relations = modelStatusData.relations;
  return Object.keys(relations).map(relationId => {
    const relation = relations[relationId];
    const { provider, requirer, peer } = extractRelationEndpoints(relation);
    return {
      columns: [
        { content: provider || peer || "-" },
        { content: requirer || "-" },
        { content: relation.interface },
        { content: relation.endpoints[0].role },
        { content: relation.status.status }
      ]
    };
  });
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

  // Toggle collapsible sidebar when component mounts/unmounts
  useEffect(() => {
    // This gets called after every render
    dispatch(collapsibleSidebar(true));
    // Cleanup when unmounting
    return () => {
      dispatch(collapsibleSidebar(false));
    };
  }, []);

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
  const relationTableRows = useMemo(
    () => generateRelationRows(modelStatusData),
    [modelStatusData]
  );

  return (
    <Layout>
      <Header>
        <div className="model-details__header">
          <strong>{modelStatusData ? modelStatusData.model.name : ""}</strong>
          <div className="model-details__filters">
            <Filter label="View:" filters={viewFilters} />
            <Filter label="Status:" filters={statusFilters} />
          </div>
          <UserIcon />
        </div>
      </Header>
      <div className="model-details">
        <InfoPanel />
        <div className="model-details__main">
          <MainTable
            headers={applicationTableHeaders}
            rows={applicationTableRows}
            sortable
          />
          <MainTable headers={unitTableHeaders} rows={unitTableRows} sortable />
          <MainTable
            headers={relationTableHeaders}
            rows={relationTableRows}
            sortable
          />
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
