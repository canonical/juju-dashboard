import { URL } from "@canonical/jaaslib/lib/urls";
import cloneDeep from "clone-deep";

import {
  extractRevisionNumber,
  generateStatusElement,
  generateSpanClass,
  generateRelationIconImage,
  splitParts,
  extractRelationEndpoints,
  generateIconImg,
} from "app/utils";

export const localApplicationTableHeaders = [
  { content: "local apps", sortKey: "local-apps" },
  { content: "status", sortKey: "status" },
  { content: "version", className: "u-align--right", sortKey: "version" },
  { content: "scale", className: "u-align--right", sortKey: "scale" },
  { content: "store", sortKey: "store" },
  { content: "rev", className: "u-align--right", sortKey: "rev" },
  { content: "os", sortKey: "os" },
  { content: "notes", sortKey: "notes" },
];

export const remoteApplicationTableHeaders = [
  { content: "remote apps", sortKey: "remote-apps" },
  { content: "status", sortKey: "status" },
  { content: "interface", sortKey: "interface" },
  { content: "offer url", sortKey: "offer-url" },
  { content: "store", sortKey: "store" },
];

export const unitTableHeaders = [
  { content: "unit", sortKey: "unit" },
  { content: "workload", sortKey: "workload" },
  { content: "agent", sortKey: "agent" },
  { content: "machine", className: "u-align--right", sortKey: "machine" },
  { content: "public address", sortKey: "publicAddress" },
  { content: "port", className: "u-align--right", sortKey: "port" },
  { content: "message", sortKey: "message" },
];

export const machineTableHeaders = [
  { content: "machine", sortKey: "machine" },
  { content: "apps", sortKey: "apps" },
  { content: "state", sortKey: "state" },
  { content: "az", sortKey: "az" },
  { content: "instance id", sortKey: "instanceId" },
  { content: "message", sortKey: "message" },
];

export const relationTableHeaders = [
  { content: "relation provider", sortKey: "provider" },
  { content: "requirer", sortKey: "requirer" },
  { content: "interface", sortKey: "interface" },
  { content: "type", sortKey: "type" },
  { content: "message", sortKey: "message" },
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

export const appsOffersTableHeaders = [
  { content: "offers" },
  { content: "connection" },
  { content: "interface" },
  { content: "offer url" },
];

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

export function generateLocalApplicationRows(
  modelStatusData,
  onRowClick,
  baseAppURL,
  query
) {
  if (!modelStatusData) {
    return [];
  }

  const applications = cloneDeep(modelStatusData.applications);

  Object.keys(applications).forEach((key) => {
    const units = applications[key].units || {};
    applications[key].unitsCount = Object.keys(units).length;
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
      onClick: () => onRowClick(key, "apps"),
      "data-app": key,
      className:
        query?.panel === "apps" && query?.entity === key ? "is-selected" : "",
    };
  });
}

export function generateRemoteApplicationRows(
  modelStatusData,
  onRowClick,
  baseAppURL,
  query
) {
  if (!modelStatusData) {
    return [];
  }
  const applications = cloneDeep(modelStatusData["remote-applications"]);
  return (
    applications &&
    Object.keys(applications).map((key) => {
      const app = applications[key];
      const status = app.status.status;
      const offerUrl = app["offer-url"];

      const interfaces = Object.keys(app?.["relations"]).map(
        (endpointInterface) => endpointInterface
      );

      return {
        columns: [
          {
            "data-test-column": "app",
            content: app["offer-name"], // we cannot access charm name
            className: "u-truncate",
          },
          {
            "data-test-column": "status",
            content: status,
            className: "u-capitalise u-truncate",
          },
          {
            "data-test-column": "interface",
            content: interfaces.join(","),
          },
          {
            "data-test-column": "offer_url",
            content: offerUrl,
            className: "u-truncate",
          },
          {
            "data-test-column": "store",
            content: "-", // store info not yet available from API
          },
        ],
        sortData: {
          app: key,
          status: "status",
          interface: "interface",
          offer_url: "offer_url",
          store: "store",
        },
        "data-app": key,
        onClick: () => false && onRowClick(key, "remoteApps"), // DISABLED PANEL
        className:
          query?.panel === "remoteApps" && query?.entity === key
            ? "is-selected"
            : "",
      };
    })
  );
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
      const workload = unit["workload-status"].status || "-";
      const agent = unit["agent-status"].status || "-";
      const publicAddress = unit["public-address"] || "-";
      const port = unit?.["opened-ports"]?.join(" ") || "-";
      const message = unit["workload-status"].info || "-";
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
            content: generateStatusElement(workload),
            className: "u-capitalise",
          },
          { content: agent },
          { content: unit.machine, className: "u-align--right" },
          { content: publicAddress },
          {
            content: port,
            className: "u-align--right",
          },
          {
            content: <span title={message}>{message}</span>,
            className: "u-truncate",
          },
        ],
        sortData: {
          unit: unitId,
          workload,
          agent,
          machine: unit.machine,
          publicAddress,
          port,
          message,
        },
        onClick: () => onRowClick(unitId, "units"),
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
                  baseAppURL,
                  true // disable link
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
            // This is using the parent data for sorting so that they stick to
            // their parent while being sorted. This isn't fool-proof but it's
            // the best we have for the current design and table implementation.
            sortData: {
              unit: unitId,
              workload,
              agent,
              machine: unit.machine,
              publicAddress,
              port,
              message,
            },
          });
        }
      }
    });
  });

  return unitRows;
}

export function generateMachineRows(
  modelStatusData,
  onRowClick,
  selectedEntity
) {
  if (!modelStatusData) {
    return [];
  }

  const generateMachineApps = (machineId) => {
    const appsOnMachine = [];
    const modelApplications = modelStatusData?.applications;
    modelApplications &&
      Object.entries(modelApplications).forEach(([appName, appInfo]) => {
        appInfo?.units &&
          Object.values(appInfo.units).forEach((unitInfo) => {
            if (machineId === unitInfo.machine) {
              appsOnMachine.push([appName, appInfo.charm]);
            }
          });
      });

    const apps = appsOnMachine.length
      ? appsOnMachine.map((app) => {
          return generateIconImg(app[0], app[1]);
        })
      : "None";
    return apps;
  };

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
          content: generateMachineApps(machineId),
          className: "machine-app-icons",
        },
        {
          content: generateStatusElement(machine["agent-status"].status),
          className: "u-capitalise",
        },
        { content: az },
        { content: machine.instanceId },
        {
          content: (
            <span title={machine["agent-status"].info}>
              {machine["agent-status"].info}
            </span>
          ),
          className: "u-truncate",
        },
      ],
      sortData: {
        machine: machine.series,
        state: machine?.["agent-status"]?.status,
        az,
        instanceId: machine.instanceId,
        message: machine?.agentStatus?.info,
      },
      onClick: () => onRowClick(machineId, "machines"),
      "data-machine": machineId,
      className: selectedEntity === machineId ? "is-selected" : "",
    };
  });
}

export function generateRelationRows(modelStatusData, baseAppURL) {
  if (!modelStatusData) {
    return [];
  }
  const relations = modelStatusData.relations || {};
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

    const providerLabel = provider || peer || "-";
    const requirerLabel = requirer || "-";
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
              {providerLabel}
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
              {requirerLabel}
            </>
          ),
          title: requirerLabel,
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
      sortData: {
        provider: providerLabel,
        requirer: requirerLabel,
        interface: relation.interface,
        type: relation?.endpoints[0]?.role,
        message: relation?.status?.status,
      },
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

export function generateAppOffersRows(
  modelStatusData,
  onRowClick,
  baseAppURL,
  query
) {
  if (!modelStatusData) {
    return [];
  }

  const offers = modelStatusData.offers;

  return Object.keys(offers).map((offerId) => {
    const offer = offers[offerId];

    const interfaces = Object.keys(offer?.["endpoints"]).map(
      (endpointInterface) => endpointInterface
    );

    return {
      columns: [
        {
          content: (
            <>
              {generateRelationIconImage(offer, modelStatusData, baseAppURL)}
              {offer["offer-name"]}
            </>
          ),
          className: "u-truncate",
        },
        {
          content: (
            <>
              {offer["active-connected-count"]} /{" "}
              {offer["total-connected-count"]}
            </>
          ),
        },
        {
          content: <>{interfaces.join(",")}</>,
        },
        {
          content: "-", // offer url is not yet available from the API
        },
      ],
      onClick: () => false && onRowClick(offerId, "offers"), // DISABLED PANEL
      "data-app": offerId,
      className:
        query.panel === "offers" && query.entity === offerId
          ? "is-selected"
          : "",
    };
  });
}

export function generateConsumedRows(modelStatusData, baseAppURL) {
  if (!modelStatusData) {
    return [];
  }

  const remoteApplications = modelStatusData["remote-applications"] || {};
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
