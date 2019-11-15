import React, { useEffect, useMemo } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import Terminal from "components/Terminal/Terminal";
import Header from "components/Header/Header";
import UserIcon from "components/UserIcon/UserIcon";

import { getModelUUID, getModelStatus } from "app/selectors";
import { fetchModelStatus } from "juju/actions";
import { collapsibleSidebar } from "app/actions";
import { generateStatusIcon, generateSpanClass } from "app/utils";

import "./_model-details.scss";

const applicationTableHeaders = [
  { content: "app" },
  { content: "status" },
  { content: "version", className: "u-align--right" },
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
  { content: "machine", className: "u-align--right" },
  { content: "public address" },
  { content: "port", className: "u-align--right" },
  { content: "message" }
];

const machineTableHeaders = [
  { content: "machine" },
  { content: "state" },
  { content: "az" },
  { content: "instance id" },
  { content: "message" }
];

const relationTableHeaders = [
  { content: "relation provider" },
  { content: "requirer" },
  { content: "interface" },
  { content: "type" },
  { content: "message" }
];

const generateEntityLink = (namespace, href, name, subordinate) => {
  return (
    <>
      {subordinate && <span className="subordinate"></span>}
      {namespace && (
        <img
          alt={name + " icon"}
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
          ),
          className: "u-display--flex"
        },
        {
          content: app.status ? generateStatusIcon(app.status.status) : "-",
          className: "u-capitalise"
        },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "CharmHub" },
        { content: key.split("-")[-1] || "-", className: "u-align--right" },
        { content: "Ubuntu" },
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
            ),
            className: "u-display--flex"
          },
          {
            content: generateStatusIcon(unit.workloadStatus.status),
            className: "u-capitalise"
          },
          { content: unit.agentStatus.status },
          { content: unit.machine, className: "u-align--right" },
          { content: unit.publicAddress },
          {
            content: unit.publicAddress.split(":")[-1] || "-",
            className: "u-align--right"
          },
          { content: unit.workloadStatus.info }
        ]
      });

      const subordinates = unit.subordinates;

      if (subordinates) {
        for (let [key] of Object.entries(subordinates)) {
          const subordinate = subordinates[key];
          unitRows.push({
            columns: [
              {
                content: generateEntityLink(
                  subordinate.charm.replace("cs:", ""),
                  "#",
                  key,
                  true
                )
              },
              {
                content: generateStatusIcon(
                  subordinate["workload-status"].status
                ),
                className: "u-capitalise"
              },
              { content: subordinate["agent-status"].status },
              { content: subordinate.machine, className: "u-align--right" },
              { content: subordinate["public-address"] },
              {
                content: subordinate["public-address"].split(":")[-1] || "-",
                className: "u-align--right"
              },
              { content: subordinate["workload-status"].info }
            ],
            className: "subordinate-row"
          });
        }
      }
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
        {
          content: generateSpanClass(
            "u-capitalise--first-letter",
            relation.status.status
          )
        }
      ]
    };
  });
};

const splitParts = hardware =>
  Object.fromEntries(
    hardware.split(" ").map(item => {
      const parts = item.split("=");
      return [parts[0], parts[1]];
    })
  );

const generateMachineRows = modelStatusData => {
  if (!modelStatusData) {
    return [];
  }

  const machines = modelStatusData.machines;
  return Object.keys(machines).map(machineId => {
    const machine = machines[machineId];
    return {
      columns: [
        {
          content: (
            <>
              <div>{machineId}</div>
              <a href="#_">{machine.dnsName}</a>
            </>
          )
        },
        {
          content: generateStatusIcon(machine.instanceStatus.status),
          className: "u-capitalise"
        },
        { content: splitParts(machine.hardware)["availability-zone"] },
        { content: machine.instanceId },
        {
          content: (
            <span title={machine.instanceStatus.info}>
              {machine.instanceStatus.info}
            </span>
          ),
          className: "model-details__truncate-cell"
        }
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

  useEffect(() => {
    dispatch(collapsibleSidebar(true));
    return () => {
      dispatch(collapsibleSidebar(false));
    };
  }, [dispatch]);

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
  const machinesTableRows = useMemo(
    () => generateMachineRows(modelStatusData),
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
      <div className="l-content">
        <div className="model-details">
          <InfoPanel />
          <div className="model-details__main">
            <MainTable
              headers={applicationTableHeaders}
              rows={applicationTableRows}
              className="model-details__apps"
              sortable
            />
            <MainTable
              headers={unitTableHeaders}
              rows={unitTableRows}
              className="model-details__units"
              sortable
            />
            <MainTable
              headers={machineTableHeaders}
              rows={machinesTableRows}
              className="model-details__machines"
              sortable
            />
            <MainTable
              headers={relationTableHeaders}
              rows={relationTableRows}
              className="model-details__relations"
              sortable
            />
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
