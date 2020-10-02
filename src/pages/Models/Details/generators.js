import React from "react";
import { URL } from "@canonical/jaaslib/lib/urls";
import cloneDeep from "clone-deep";

import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";

import {
  extractRevisionNumber,
  generateStatusElement,
  generateIconPath,
  generateSpanClass,
} from "app/utils";

export const applicationTableHeaders = [
  { content: "app", sortKey: "app" },
  { content: "status", sortKey: "status" },
  { content: "version", className: "u-align--right", sortKey: "version" },
  { content: "scale", className: "u-align--right", sortKey: "scale" },
  { content: "store", sortKey: "store" },
  { content: "rev", className: "u-align--right", sortKey: "rev" },
  { content: "os", sortKey: "os" },
  { content: "notes", sortKey: "notes" },
];

export const unitTableHeaders = [
  { content: "unit" },
  { content: "workload" },
  { content: "agent" },
  { content: "machine", className: "u-align--right" },
  { content: "public address" },
  { content: "port", className: "u-align--right" },
  { content: "message" },
];

export const machineTableHeaders = [
  { content: "machine", sortKey: "machine" },
  { content: "state", sortKey: "state" },
  { content: "az", sortKey: "az" },
  { content: "instance id", sortKey: "instanceId" },
  { content: "message", sortKey: "message" },
];

export const relationTableHeaders = [
  { content: "relation provider" },
  { content: "requirer" },
  { content: "interface" },
  { content: "type" },
  { content: "message" },
];

export const consumedTableHeaders = [
  { content: "consumed" },
  { content: "endpoint" },
  { content: "status" },
];

export const offersTableHeaders = [
  { content: "connected offers" },
  { content: "endpoints" },
  { content: "connections" },
];

export function generateIconImg(name, namespace, baseAppURL) {
  let iconSrc = defaultCharmIcon;
  if (namespace.indexOf("local:") !== 0) {
    iconSrc = generateIconPath(namespace);
  }
  return (
    <img
      alt={name + " icon"}
      width="24"
      height="24"
      className="entity-icon"
      src={iconSrc}
    />
  );
}

export function generateEntityIdentifier(
  namespace,
  name,
  subordinate,
  baseAppURL,
  disableLink = false
) {
  let charmStorePath = "";
  try {
    charmStorePath = URL.fromAnyString(namespace).toString().replace("cs:", "");
  } catch (e) {
    console.error("unable to parse charmstore path", e);
  }

  return (
    <div className="entity-name">
      {subordinate && <span className="subordinate"></span>}
      {namespace && generateIconImg(name, namespace, baseAppURL)}
      {/* Ensure app is not a local charm or disable link is true */}
      {namespace.includes("cs:") && !disableLink ? (
        <a
          data-test="app-link"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.jaas.ai/${charmStorePath}`}
        >
          {name}
        </a>
      ) : (
        name
      )}
    </div>
  );
}

export function generateApplicationRows(
  modelStatusData,
  onRowClick,
  baseAppURL,
  selectedEntity
) {
  if (!modelStatusData) {
    return [];
  }

  const applications = cloneDeep(modelStatusData.applications);

  Object.keys(applications).forEach((key) => {
    applications[key].unitsCount = Object.keys(applications[key].units).length;
  });

  return Object.keys(applications).map((key) => {
    const app = applications[key];
    const rev = extractRevisionNumber(app.charm) || "-";
    const store = app.charm.indexOf("local:") === 0 ? "Local" : "CharmHub";
    const scale = app.unitsCount;
    const version = app.workloadVersion || "-";
    return {
      columns: [
        {
          "data-test-column": "name",
          content: generateEntityIdentifier(
            app.charm || "",
            key,
            false,
            baseAppURL,
            true
          ),
          className: "u-truncate",
        },
        {
          "data-test-column": "status",
          content: app.status ? generateStatusElement(app.status.status) : "-",
          className: "u-capitalise u-truncate",
        },
        {
          "data-test-column": "version",
          content: version,
          className: "u-align--right",
        },
        {
          "data-test-column": "scale",
          content: scale,
          className: "u-align--right",
        },
        {
          "data-test-column": "store",
          content: store,
        },
        {
          "data-test-column": "revision",
          content: rev,
          className: "u-align--right",
        },
        { "data-test-column": "os", content: "Ubuntu" },
        { "data-test-column": "notes", content: "-" },
      ],
      sortData: {
        app: key,
        status: app.status?.status,
        version,
        scale,
        store,
        rev,
        os: "Ubuntu",
        notes: "-",
      },
      onClick: (e) => onRowClick(e, app),
      "data-app": key,
      className: selectedEntity === key ? "is-selected" : "",
    };
  });
}

export function generateUnitRows(
  modelStatusData,
  onRowClick,
  baseAppURL,
  selectedEntity
) {
  if (!modelStatusData) {
    return [];
  }

  const applications = modelStatusData.applications;
  const unitRows = [];
  Object.keys(applications).forEach((applicationName) => {
    const units = applications[applicationName].units || [];
    Object.keys(units).forEach((unitId) => {
      const unit = units[unitId];
      unitRows.push({
        columns: [
          {
            content: generateEntityIdentifier(
              applications[applicationName].charm
                ? applications[applicationName].charm
                : "",
              unitId,
              false,
              baseAppURL,
              true // disable link
            ),
            className: "u-truncate",
          },
          {
            content: generateStatusElement(unit.workloadStatus.status),
            className: "u-capitalise",
          },
          { content: unit.agentStatus.status },
          { content: unit.machine, className: "u-align--right" },
          { content: unit.publicAddress },
          {
            content: unit.openedPorts.join(" ") || "-",
            className: "u-align--right",
          },
          {
            content: (
              <span title={unit.workloadStatus.info}>
                {unit.workloadStatus.info}
              </span>
            ),
            className: "u-truncate",
          },
        ],
        onClick: (e) => onRowClick(e, unitId),
        "data-unit": unitId,
        className: selectedEntity === unitId ? "is-selected" : "",
      });

      const subordinates = unit.subordinates;

      if (subordinates) {
        for (let [key] of Object.entries(subordinates)) {
          const subordinate = subordinates[key];
          unitRows.push({
            columns: [
              {
                content: generateEntityIdentifier(
                  subordinate.charm,
                  key,
                  true,
                  baseAppURL
                ),
                className: "u-truncate",
              },
              {
                content: generateStatusElement(
                  subordinate["workload-status"].status
                ),
                className: "u-capitalise",
              },
              { content: subordinate["agent-status"].status },
              { content: subordinate.machine, className: "u-align--right" },
              { content: subordinate["public-address"] },
              {
                content: subordinate["public-address"].split(":")[-1] || "-",
                className: "u-align--right",
              },
              {
                content: subordinate["workload-status"].info,
                className: "u-truncate",
              },
            ],
          });
        }
      }
    });
  });

  return unitRows;
}

const splitParts = (hardware) =>
  Object.fromEntries(
    hardware.split(" ").map((item) => {
      const parts = item.split("=");
      return [parts[0], parts[1]];
    })
  );

export function generateMachineRows(
  modelStatusData,
  onRowClick,
  selectedEntity
) {
  if (!modelStatusData) {
    return [];
  }

  const machines = modelStatusData.machines;
  return Object.keys(machines).map((machineId) => {
    const machine = machines[machineId];
    const az = splitParts(machine.hardware)["availability-zone"] || "";
    return {
      columns: [
        {
          content: (
            <>
              <div>
                {machineId}
                <span className="u-capitalise">. {machine.series}</span>
              </div>
              {machine.dnsName}
            </>
          ),
        },
        {
          content: generateStatusElement(machine.agentStatus.status),
          className: "u-capitalise",
        },
        { content: az },
        { content: machine.instanceId },
        {
          content: (
            <span title={machine.agentStatus.info}>
              {machine.agentStatus.info}
            </span>
          ),
          className: "u-truncate",
        },
      ],
      sortData: {
        machine: machine.series,
        state: machine?.agentStatus?.status,
        az,
        instanceId: machine.instanceId,
        message: machine?.agentStatus?.info,
      },
      onClick: (e) => onRowClick(e, machineId),
      "data-machine": machineId,
      className: selectedEntity === machineId ? "is-selected" : "",
    };
  });
}

const extractRelationEndpoints = (relation) => {
  const endpoints = {};
  relation.endpoints.forEach((endpoint) => {
    const role = endpoint.role;
    endpoints[role] = endpoint.application + ":" + endpoint.name;
    endpoints[`${role}ApplicationName`] = endpoint.application;
  });
  return endpoints;
};

const generateRelationIconImage = (
  applicationName,
  modelStatusData,
  baseAppURL
) => {
  const application = modelStatusData.applications[applicationName];
  if (!application || !applicationName) {
    return;
  }
  return generateIconImg(applicationName, application.charm, baseAppURL);
};

export function generateRelationRows(modelStatusData, baseAppURL) {
  if (!modelStatusData) {
    return [];
  }

  const relations = modelStatusData.relations;
  return Object.keys(relations).map((relationId) => {
    const relation = relations[relationId];
    const {
      provider,
      requirer,
      peer,
      providerApplicationName,
      requirerApplicationName,
      peerApplicationName,
    } = extractRelationEndpoints(relation);

    return {
      columns: [
        {
          content: (
            <>
              {generateRelationIconImage(
                providerApplicationName || peerApplicationName,
                modelStatusData,
                baseAppURL
              )}
              {provider || peer || "-"}
            </>
          ),
          className: "u-truncate",
        },
        {
          content: (
            <>
              {generateRelationIconImage(
                requirerApplicationName,
                modelStatusData,
                baseAppURL
              )}
              {requirer || "-"}
            </>
          ),
          title: requirer || "-",
          className: "u-truncate",
        },
        { content: relation.interface },
        { content: relation.endpoints[0].role },
        {
          content: generateSpanClass(
            "u-capitalise--first-letter",
            relation.status.status
          ),
        },
      ],
    };
  });
}

export function generateOffersRows(modelStatusData, baseAppURL) {
  if (!modelStatusData) {
    return [];
  }

  const offers = modelStatusData.offers;
  return Object.keys(offers).map((offerId) => {
    const offer = offers[offerId];
    return {
      columns: [
        {
          content: (
            <>
              {generateRelationIconImage(
                offer.applicationName,
                modelStatusData,
                baseAppURL
              )}
              {offer.applicationName}
            </>
          ),
          className: "u-truncate",
        },
        {
          content: Object.entries(offer.endpoints)
            .map((endpoint) => `${endpoint[1].name}:${endpoint[1].interface}`)
            .join("/n"),
          className: "u-truncate",
        },
        {
          content: offer.activeConnectedCount,
        },
      ],
    };
  });
}

export function generateConsumedRows(modelStatusData, baseAppURL) {
  if (!modelStatusData) {
    return [];
  }

  const remoteApplications = modelStatusData.remoteApplications;
  return Object.keys(remoteApplications).map((appName) => {
    const application = remoteApplications[appName];
    return {
      columns: [
        {
          content: (
            <>
              {generateRelationIconImage(
                application.offerName,
                modelStatusData,
                baseAppURL
              )}
              {application.offerName}
            </>
          ),
          className: "u-truncate",
        },
        {
          content: Object.entries(application.endpoints)
            .map((endpoint) => `${endpoint[1].name}:${endpoint[1].interface}`)
            .join("/n"),
          className: "u-truncate",
        },
        {
          content: application.status.status,
        },
      ],
    };
  });
}
