import cloneDeep from "clone-deep";
import { Field } from "formik";

import {
  extractRevisionNumber,
  generateStatusElement,
  generateSpanClass,
  generateRelationIconImage,
  splitParts,
  extractRelationEndpoints,
  generateIconImg,
  generateEntityIdentifier,
} from "app/utils/utils";

export function generateLocalApplicationRows(
  modelStatusData,
  tableRowClick,
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
    const store = app.charm.indexOf("local:") === 0 ? "Local" : "Charmhub";
    const scale = app.unitsCount;
    const version = app["workload-version"] || "-";

    return {
      columns: [
        {
          "data-test-column": "name",
          content: generateEntityIdentifier(app.charm || "", key, false, true),
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
        {
          "data-test-column": "os",
          content: app.series,
          className: "u-capitalise",
        },
        {
          "data-test-column": "message",
          content: app.status.info,
          className: "u-truncate",
          title: app.status.info,
        },
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
      onClick: (e) => tableRowClick("app", key, e),
      "data-app": key,
      className:
        query?.panel === "apps" && query?.entity === key ? "is-selected" : "",
    };
  });
}

export function generateRemoteApplicationRows(
  modelStatusData,
  tableRowClick,
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
        onClick: (e) => false && tableRowClick(key, "remoteApps", e), // DISABLED PANEL
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
  tableRowClick,
  showCheckbox,
  hideMachines
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
      let columns = [
        {
          content: generateEntityIdentifier(
            applications[applicationName].charm
              ? applications[applicationName].charm
              : "",
            unitId,
            false,
            true // disable link
          ),
          className: "u-truncate",
        },
        {
          content: generateStatusElement(workload),
          className: "u-capitalise",
        },
        { content: agent },
        { content: unit.machine, className: "u-align--right", key: "machine" },
        { content: publicAddress },
        {
          content: port,
          className: "u-align--right",
          title: port,
        },
        {
          content: <span title={message}>{message}</span>,
          className: "u-truncate",
        },
      ];

      if (hideMachines) {
        columns = columns.filter((column) => !(column.key === "machine"));
      }

      if (showCheckbox) {
        const fieldID = `table-checkbox-${unitId}`;
        const ariaLabeledBy = `aria-labeled-${unitId}`;
        columns.splice(0, 0, {
          content: (
            <label className="p-checkbox" htmlFor={fieldID}>
              <Field
                id={fieldID}
                type="checkbox"
                aria-labelledby={ariaLabeledBy}
                className="p-checkbox__input"
                name="selectedUnits"
                value={unitId}
              />
              <span className="p-checkbox__label" id={ariaLabeledBy}></span>
            </label>
          ),
        });
      }

      unitRows.push({
        columns,
        sortData: {
          unit: unitId,
          workload,
          agent,
          machine: unit.machine,
          publicAddress,
          port,
          message,
        },
        onClick: (e) => tableRowClick("unit", unitId, e),
        "data-unit": unitId,
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
  tableRowClick,
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
      onClick: (e) => tableRowClick("machine", machineId, e),
      "data-machine": machineId,
      className: selectedEntity === machineId ? "is-selected" : "",
    };
  });
}

export function generateRelationRows(modelStatusData) {
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
                modelStatusData
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
                modelStatusData
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

export function generateOffersRows(modelStatusData) {
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
                modelStatusData
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

export function generateAppOffersRows(modelStatusData, tableRowClick, query) {
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
              {generateRelationIconImage(offer, modelStatusData)}
              {offer["offer-name"]}
            </>
          ),
          className: "u-truncate",
        },
        {
          content: <>{interfaces.join(",")}</>,
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
          content: "-", // offer url is not yet available from the API
        },
      ],
      onClick: (e) => false && tableRowClick(offerId, "offers", e), // DISABLED PANEL
      "data-app": offerId,
      className:
        query.panel === "offers" && query.entity === offerId
          ? "is-selected"
          : "",
    };
  });
}

export function generateConsumedRows(modelStatusData) {
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
                modelStatusData
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
