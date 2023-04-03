import cloneDeep from "clone-deep";
import { Field } from "formik";
import { Anchorme } from "react-anchorme";

import { RemoteEndpoint } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import {
  extractRevisionNumber,
  extractRelationEndpoints,
} from "store/juju/utils/models";
import {
  generateEntityIdentifier,
  generateRelationIconImage,
  generateStatusElement,
  generateIconImg,
  copyToClipboard,
} from "components/utils";
import { Button, Icon } from "@canonical/react-components";
import {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { ApplicationData, RelationData, UnitData } from "juju/types";
import { StatusData } from "store/juju/selectors";
import { ModelData } from "store/juju/types";
import { Link } from "react-router-dom";
import urls from "urls";
import TruncatedTooltip from "components/TruncatedTooltip";

export type ModelParams = {
  modelName: string;
  userName: string;
};

export type Query = {
  panel?: string | null;
  entity?: string | null;
  activeView?: string | null;
};

const generateAddress = (address?: string | null) =>
  address ? (
    <>
      {address}{" "}
      <Button
        appearance="base"
        className="has-hover__hover-state is-small"
        onClick={(event) => {
          // Prevent navigating to the details page:
          event.stopPropagation();
          copyToClipboard(address);
        }}
        hasIcon
      >
        <Icon name="copy" />
      </Button>
    </>
  ) : (
    "-"
  );

export function generateLocalApplicationRows(
  applications: ApplicationData | null,
  applicationStatuses: StatusData | null,
  modelParams: ModelParams,
  query?: Query
) {
  if (!applications || !applicationStatuses) {
    return [];
  }

  function getStore(charmURL: string) {
    if (charmURL) {
      return charmURL.indexOf("local:") === 0 ? "Local" : "Charmhub";
    }
    return "";
  }

  return Object.keys(applications).map((key) => {
    const app = applications[key];
    const rev = extractRevisionNumber(app["charm-url"]) || "-";
    const store = getStore(app["charm-url"]);
    const version = app["workload-version"] || "-";
    const status = app.status
      ? generateStatusElement(applicationStatuses[app.name])
      : "-";
    const message = (
      <Anchorme target="_blank" rel="noreferrer noopener" truncate={20}>
        {app.status?.message ?? ""}
      </Anchorme>
    );
    return {
      columns: [
        {
          "data-test-column": "name",
          content: (
            <Link
              to={urls.model.app.index({
                userName: modelParams.userName,
                modelName: modelParams.modelName,
                appName: key.replace("/", "-"),
              })}
            >
              {generateEntityIdentifier(app["charm-url"] || "", key, false)}
            </Link>
          ),
        },
        {
          "data-test-column": "status",
          content: (
            <TruncatedTooltip message={status}>{status}</TruncatedTooltip>
          ),
          className: "u-capitalise",
        },
        {
          "data-test-column": "version",
          content: app["workload-version"] || "-",
        },
        {
          "data-test-column": "scale",
          content: app["unit-count"],
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
          "data-test-column": "message",
          content: app.status?.message ? (
            <TruncatedTooltip message={message}>{message}</TruncatedTooltip>
          ) : null,
        },
      ],
      sortData: {
        app: key,
        status,
        version,
        scale: app["unit-count"],
        store,
        rev,
        notes: "-",
      },
      "data-app": key,
      className:
        query?.panel === "apps" && query?.entity === key ? "is-selected" : "",
    };
  });
}

export function generateRemoteApplicationRows(
  modelStatusData: ModelData | null,
  modelParams: ModelParams,
  query?: Query
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
            // we cannot access charm name
            content: (
              <TruncatedTooltip message={app["offer-name"]}>
                {app["offer-name"]}
              </TruncatedTooltip>
            ),
          },
          {
            "data-test-column": "status",
            content: (
              <TruncatedTooltip message={status}>{status}</TruncatedTooltip>
            ),
            className: "u-capitalise",
          },
          {
            "data-test-column": "interface",
            content: interfaces.join(","),
          },
          {
            "data-test-column": "offer_url",
            content: (
              <TruncatedTooltip message={offerUrl}>{offerUrl}</TruncatedTooltip>
            ),
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
        className:
          query?.panel === "remoteApps" && query?.entity === key
            ? "is-selected"
            : "",
      };
    })
  );
}

const generateUnitURL = (modelParams: ModelParams, unitId: string) => {
  const id = unitId.replace("/", "-");
  const appName = id?.split("-").slice(0, -1).join("-");
  return urls.model.unit({
    userName: modelParams.userName,
    modelName: modelParams.modelName,
    appName,
    unitId: id,
  });
};

export function generateUnitRows(
  units: UnitData | null,
  modelParams: ModelParams,
  showCheckbox?: boolean,
  hideMachines?: boolean
) {
  if (!units) {
    return [];
  }

  function generatePortsList(ports: UnitData[0]["ports"]) {
    if (!ports || ports.length === 0) {
      return "-";
    }
    return ports.map((portData) => portData.number).join(", ");
  }

  const clonedUnits: {
    [unitName: string]: UnitData[0] & {
      subordinates?: { [unitId: string]: UnitData[0] };
    };
  } = cloneDeep(units);

  // Restructure the unit list data to allow for the proper subordinate
  // rendering with the current table setup.
  Object.entries(clonedUnits).forEach(([unitId, unitData]) => {
    // The unit list may not have the principal in it because this code is
    // used to generate the table for the application unit list as well
    // in which case it'll be the only units in the list.
    if (unitData.subordinate && clonedUnits[unitData.principal]) {
      if (!clonedUnits[unitData.principal].subordinates) {
        clonedUnits[unitData.principal].subordinates = {};
      }
      const subordinates = clonedUnits[unitData.principal].subordinates;
      if (subordinates) {
        subordinates[unitId] = unitData;
      }
      delete clonedUnits[unitId];
    }
  });

  const unitRows: (MainTableRow & { "data-unit": string })[] = [];
  Object.keys(clonedUnits).forEach((unitId) => {
    const unit = clonedUnits[unitId];
    const workload = unit["workload-status"].current || "-";
    const agent = unit["agent-status"].current || "-";
    const publicAddress = unit["public-address"];
    const ports = generatePortsList(unit.ports);
    const message = unit["workload-status"].message || "-";
    const messageWithLinks = (
      <Anchorme target="_blank" rel="noreferrer noopener" truncate={20}>
        {message}
      </Anchorme>
    );
    const charm = unit["charm-url"];
    const name = generateEntityIdentifier(charm ? charm : "", unitId, false);
    let columns: MainTableCell[] = [
      {
        content: (
          <Link to={generateUnitURL(modelParams, unitId)}>
            <TruncatedTooltip message={name}>{name}</TruncatedTooltip>
          </Link>
        ),
      },
      {
        content: generateStatusElement(workload),
        className: "u-capitalise",
      },
      { content: agent },
      {
        content: unit["machine-id"],
        className: "u-align--right",
        key: "machine",
      },
      {
        content: generateAddress(publicAddress),
        className: "u-flex has-hover",
      },
      {
        content: <TruncatedTooltip message={ports}>{ports}</TruncatedTooltip>,
        className: "u-align--right",
      },
      {
        content: (
          <TruncatedTooltip
            message={messageWithLinks}
            tooltipClassName="p-tooltip--constrain-width"
          >
            {messageWithLinks}
          </TruncatedTooltip>
        ),
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
          <label className="p-checkbox--inline" htmlFor={fieldID}>
            <Field
              id={fieldID}
              type="checkbox"
              aria-labelledby={ariaLabeledBy}
              className="p-checkbox__input"
              name="selectedUnits"
              value={unitId}
              data-testid={fieldID}
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
        machine: unit["machine-id"],
        publicAddress,
        ports,
        message,
      },
      "data-unit": unitId,
    });

    const subordinates = unit.subordinates;

    if (subordinates) {
      for (let [key] of Object.entries(subordinates)) {
        const subordinate = subordinates[key];
        const address = subordinate["public-address"];
        const workloadStatus = subordinate["workload-status"].current;
        const name = generateEntityIdentifier(
          subordinate["charm-url"],
          key,
          true
        );
        let columns: MainTableCell[] = [
          {
            content: (
              <Link to={generateUnitURL(modelParams, unitId)}>
                <TruncatedTooltip message={name}>{name}</TruncatedTooltip>
              </Link>
            ),
            className: "u-truncate",
          },
          {
            content: generateStatusElement(
              subordinate["workload-status"].current
            ),
            className: "u-capitalise",
          },
          { content: subordinate["agent-status"].current },
          { content: subordinate["machine-id"], className: "u-align--right" },
          { content: generateAddress(address), className: "u-flex has-hover" },
          {
            content: subordinate["public-address"].split(":")[-1] || "-",
            className: "u-align--right",
          },
          {
            content: (
              <TruncatedTooltip message={workloadStatus}>
                {workloadStatus}
              </TruncatedTooltip>
            ),
          },
        ];

        if (showCheckbox) {
          // Add an extra column if the checkbox is shown on the parent.
          columns.splice(0, 0, {
            content: "",
          });
        }

        unitRows.push({
          columns,
          // This is using the parent data for sorting so that they stick to
          // their parent while being sorted. This isn't fool-proof but it's
          // the best we have for the current design and table implementation.
          sortData: {
            unit: unitId,
            workload,
            agent,
            machine: unit["machine-id"],
            publicAddress,
            ports,
            message,
          },
          "data-unit": unitId,
        });
      }
    }
  });

  return unitRows;
}

export function generateMachineRows(
  machines: ModelData["machines"] | null,
  units: UnitData | null,
  modelParams: ModelParams,
  selectedEntity?: string | null
) {
  if (!machines) {
    return [];
  }

  const generateMachineApps = (machineId: string, units: UnitData | null) => {
    const appsOnMachine: [string, string][] = [];
    units &&
      Object.values(units).forEach((unitInfo) => {
        if (machineId === unitInfo["machine-id"]) {
          appsOnMachine.push([unitInfo.application, unitInfo["charm-url"]]);
        }
      });
    const apps = appsOnMachine.length
      ? appsOnMachine.map((app) => {
          return generateIconImg(app[0], app[1]);
        })
      : "None";
    return apps;
  };

  return Object.keys(machines)
    .filter((machineId) => Boolean(machines[machineId]))
    .map((machineId) => {
      const machine = machines[machineId];
      const az =
        machine?.["hardware-characteristics"]?.["availability-zone"] || "";
      const agentStatus = machine["agent-status"].message;
      const message = (
        <Anchorme target="_blank" rel="noreferrer noopener" truncate={20}>
          {agentStatus}
        </Anchorme>
      );
      return {
        columns: [
          {
            content: (
              <>
                <Link
                  to={urls.model.machine({
                    userName: modelParams.userName,
                    modelName: modelParams.modelName,
                    machineId: machineId.replace("/", "-"),
                  })}
                >
                  {machineId}
                  <span className="u-capitalise">. {machine.series}</span>
                </Link>
                {machine.dnsName}
              </>
            ),
          },
          {
            content: generateMachineApps(machineId, units),
            className: "machine-app-icons",
          },
          {
            content: (
              <TruncatedTooltip
                message={machine["agent-status"].current}
                position="top-center"
                positionElementClassName="entity-details__machines-status-icon"
              >
                {generateStatusElement(
                  machine["agent-status"].current,
                  null,
                  true,
                  false,
                  "p-icon"
                )}
              </TruncatedTooltip>
            ),
            className: "u-capitalise",
          },
          { content: az },
          { content: machine["instance-id"] },
          {
            content: (
              <TruncatedTooltip message={message}>{message}</TruncatedTooltip>
            ),
          },
        ],
        sortData: {
          machine: machine.series,
          state: machine?.["agent-status"]?.current,
          az,
          instanceId: machine["instance-id"],
          message: machine?.["agent-status"].message,
        },
        "data-machine": machineId,
        className: selectedEntity === machineId ? "is-selected" : "",
      };
    });
}

export function generateRelationRows(
  relationData: RelationData | null,
  applications: ApplicationData | null
) {
  if (!relationData) {
    return [];
  }
  return Object.keys(relationData).map((relationId) => {
    const relation = relationData[relationId];
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
            <TruncatedTooltip message={providerLabel}>
              {applications
                ? generateRelationIconImage(
                    providerApplicationName || peerApplicationName,
                    applications
                  )
                : null}
              {providerLabel}
            </TruncatedTooltip>
          ),
        },
        {
          content: (
            <TruncatedTooltip message={requirerLabel}>
              {applications
                ? generateRelationIconImage(
                    requirerApplicationName,
                    applications
                  )
                : null}
              {requirerLabel}
            </TruncatedTooltip>
          ),
        },
        { content: relation.endpoints[0].relation.interface },
        { content: relation.endpoints[0].relation.role },
      ],
      sortData: {
        provider: providerLabel,
        requirer: requirerLabel,
        interface: relation.endpoints[0].relation.interface,
        type: relation?.endpoints[0]?.relation.role,
      },
    };
  });
}

export function generateOffersRows(modelStatusData: ModelData | null) {
  if (!modelStatusData) {
    return [];
  }

  const offers = modelStatusData.offers;
  return Object.keys(offers).map((offerId) => {
    const offer = offers[offerId];
    const endpoints = Object.entries<RemoteEndpoint>(offer.endpoints)
      .map((endpoint) => `${endpoint[1].name}:${endpoint[1].interface}`)
      .join("/n");
    return {
      columns: [
        {
          content: (
            <TruncatedTooltip message={offer.applicationName}>
              {generateRelationIconImage(
                offer.applicationName,
                modelStatusData.applications
              )}
              {offer.applicationName}
            </TruncatedTooltip>
          ),
        },
        {
          content: (
            <TruncatedTooltip message={endpoints}>{endpoints}</TruncatedTooltip>
          ),
        },
        {
          content: offer.activeConnectedCount,
        },
      ],
    };
  });
}

export function generateAppOffersRows(
  modelStatusData: ModelData | null,
  query: Query
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
            <TruncatedTooltip message={offer["offer-name"]}>
              {generateRelationIconImage(offer, modelStatusData.applications)}
              {offer["offer-name"]}
            </TruncatedTooltip>
          ),
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
      "data-app": offerId,
      className:
        query.panel === "offers" && query.entity === offerId
          ? "is-selected"
          : "",
    };
  });
}

export function generateConsumedRows(modelStatusData?: ModelData | null) {
  if (!modelStatusData) {
    return [];
  }

  const remoteApplications = modelStatusData["remote-applications"] || {};
  return Object.keys(remoteApplications).map((appName) => {
    const application = remoteApplications[appName];
    const endpoints = Object.entries<RemoteEndpoint>(application.endpoints)
      .map((endpoint) => `${endpoint[1].name}:${endpoint[1].interface}`)
      .join("/n");
    return {
      columns: [
        {
          content: (
            <TruncatedTooltip message={application.offerName}>
              {generateRelationIconImage(
                application.offerName,
                modelStatusData.applications
              )}
              {application.offerName}
            </TruncatedTooltip>
          ),
        },
        {
          content: (
            <TruncatedTooltip message={endpoints}>{endpoints}</TruncatedTooltip>
          ),
        },
        {
          content: application.status.status,
        },
      ],
    };
  });
}
