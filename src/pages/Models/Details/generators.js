import React from "react";
import classnames from "classnames";
import { URL } from "@canonical/jaaslib/lib/urls";

import {
  generateStatusElement,
  generateIconPath,
  generateSpanClass
} from "app/utils";

export const applicationTableHeaders = [
  { content: "app" },
  { content: "status" },
  { content: "version", className: "u-align--right" },
  { content: "scale", className: "u-align--right" },
  { content: "store" },
  { content: "rev", className: "u-align--right" },
  { content: "os" },
  { content: "notes" }
];

export const unitTableHeaders = [
  { content: "unit" },
  { content: "workload" },
  { content: "agent" },
  { content: "machine", className: "u-align--right" },
  { content: "public address" },
  { content: "port", className: "u-align--right" },
  { content: "message" }
];

export const machineTableHeaders = [
  { content: "machine" },
  { content: "state" },
  { content: "az" },
  { content: "instance id" },
  { content: "message" }
];

export const relationTableHeaders = [
  { content: "relation provider" },
  { content: "requirer" },
  { content: "interface" },
  { content: "type" },
  { content: "message" }
];

export function generateIconImg(name, namespace) {
  return (
    <img
      alt={name + " icon"}
      width="24"
      height="24"
      className="entity-icon"
      src={generateIconPath(namespace)}
    />
  );
}

export function generateEntityLink(namespace, name, subordinate) {
  const charmStorePath = URL.fromAnyString(namespace)
    .toString()
    .replace("cs:", "");
  return (
    <>
      {subordinate && <span className="subordinate"></span>}
      {namespace && generateIconImg(name, namespace)}
      {/* Ensure app is not a local charm */}
      {namespace.includes("cs:") ? (
        <a data-test="app-link" href={`https://www.jaas.ai/${charmStorePath}`}>
          {name}
        </a>
      ) : (
        { name }
      )}
    </>
  );
}

export function generateApplicationRows(
  modelStatusData,
  filterByApp,
  onRowClick
) {
  if (!modelStatusData) {
    return [];
  }

  const applications = modelStatusData.applications;

  return Object.keys(applications).map(key => {
    const app = applications[key];
    return {
      columns: [
        {
          content: generateEntityLink(app.charm || "", key),
          className: "u-display--flex"
        },
        {
          content: app.status ? generateStatusElement(app.status.status) : "-",
          className: "u-capitalise"
        },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "CharmHub" },
        { content: key.split("-")[-1] || "-", className: "u-align--right" },
        { content: "Ubuntu" },
        { content: "-" }
      ],
      className: filterByApp === key ? "is-selected" : "",
      onClick: onRowClick,
      "data-app": key
    };
  });
}

export function generateUnitRows(modelStatusData, filterByApp) {
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
                ? applications[applicationName].charm
                : "",
              unitId
            ),
            className: "u-display--flex"
          },
          {
            content: generateStatusElement(unit.workloadStatus.status),
            className: "u-capitalise"
          },
          { content: unit.agentStatus.status },
          { content: unit.machine, className: "u-align--right" },
          { content: unit.publicAddress },
          {
            content: unit.publicAddress.split(":")[-1] || "-",
            className: "u-align--right"
          },
          {
            content: (
              <span title={unit.workloadStatus.info}>
                {unit.workloadStatus.info}
              </span>
            ),
            className: "model-details__truncate-cell"
          }
        ],
        className: filterByApp === unitId.split("/")[0] ? "is-selected" : ""
      });

      const subordinates = unit.subordinates;

      if (subordinates) {
        for (let [key] of Object.entries(subordinates)) {
          const subordinate = subordinates[key];
          unitRows.push({
            columns: [
              {
                content: generateEntityLink(subordinate.charm, key, true),
                className: "u-display--flex"
              },
              {
                content: generateStatusElement(
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
              {
                content: subordinate["workload-status"].info,
                className: "model-details__truncate-cell"
              }
            ],
            className: classnames("subordinate-row", {
              "is-selected": filterByApp === key.split("/")[0]
            })
          });
        }
      }
    });
  });

  return unitRows;
}

const splitParts = hardware =>
  Object.fromEntries(
    hardware.split(" ").map(item => {
      const parts = item.split("=");
      return [parts[0], parts[1]];
    })
  );

export function generateMachineRows(modelStatusData, filterByApp) {
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
          content: generateStatusElement(machine.instanceStatus.status),
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
      ],
      // If there is a filter provided and the machine is visible then
      // it's been filtered so we want to highlight it.
      className: classnames({ "is-selected": !!filterByApp })
    };
  });
}

const extractRelationEndpoints = relation => {
  const endpoints = {};
  relation.endpoints.forEach(endpoint => {
    const role = endpoint.role;
    endpoints[role] = endpoint.application + ":" + endpoint.name;
    endpoints[`${role}ApplicationName`] = endpoint.application;
  });
  return endpoints;
};

const generateRelationIconImage = (applicationName, modelStatusData) => {
  const application = modelStatusData.applications[applicationName];
  if (!application || !applicationName) {
    return;
  }
  return generateIconImg(applicationName, application.charm);
};

export function generateRelationRows(modelStatusData, filterByApp) {
  if (!modelStatusData) {
    return [];
  }

  const relations = modelStatusData.relations;
  return Object.keys(relations).map(relationId => {
    const relation = relations[relationId];
    const {
      provider,
      requirer,
      peer,
      providerApplicationName,
      requirerApplicationName,
      peerApplicationName
    } = extractRelationEndpoints(relation);

    return {
      columns: [
        {
          content: (
            <>
              {generateRelationIconImage(
                providerApplicationName || peerApplicationName,
                modelStatusData
              )}
              {provider || peer || "-"}
            </>
          ),
          className: "u-display--flex"
        },
        {
          content: (
            <>
              {generateRelationIconImage(
                requirerApplicationName,
                modelStatusData
              )}
              {requirer || "-"}
            </>
          ),
          title: requirer || "-",
          className: "u-display--flex"
        },
        { content: relation.interface },
        { content: relation.endpoints[0].role },
        {
          content: generateSpanClass(
            "u-capitalise--first-letter",
            relation.status.status
          )
        }
      ],
      // If there is a filter provided and the relation is visible then
      // it's been filtered so we want to highlight it.
      className: classnames({ "is-selected": !!filterByApp })
    };
  });
}
