import type {
  RemoteApplicationStatus,
  RemoteEndpoint,
} from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type { ApplicationOfferStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import { Button, Icon } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import cloneDeep from "clone-deep";
import { Field } from "formik";
import { Anchorme } from "react-anchorme";
import { Link } from "react-router-dom";

import CharmIcon from "components/CharmIcon/CharmIcon";
import EntityIdentifier from "components/EntityIdentifier/EntityIdentifier";
import RelationIcon from "components/RelationIcon";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import { copyToClipboard } from "components/utils";
import type {
  ApplicationData,
  RelationData,
  UnitData,
  MachineData,
} from "juju/types";
import type { StatusData } from "store/juju/selectors";
import type { ModelData } from "store/juju/types";
import {
  extractRevisionNumber,
  extractRelationEndpoints,
} from "store/juju/utils/models";
import urls from "urls";

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
    <div className="u-flex u-flex--gap-small">
      <TruncatedTooltip
        wrapperClassName="u-flex-shrink u-truncate"
        message={address}
      >
        {address}
      </TruncatedTooltip>
      <div className="has-hover__hover-state">
        <Button
          appearance="base"
          className="is-small"
          onClick={(event) => {
            // Prevent navigating to the details page:
            event.stopPropagation();
            copyToClipboard(address);
          }}
          hasIcon
        >
          <Icon name="copy" />
        </Button>
      </div>
    </div>
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
    const rev =
      ("charm-url" in app && extractRevisionNumber(app["charm-url"])) || "-";
    const store = "charm-url" in app && getStore(app["charm-url"]);
    const version =
      ("workload-version" in app && app["workload-version"]) || "-";
    const status =
      "status" in app && app.status ? (
        <Status status={applicationStatuses[app.name]} />
      ) : (
        "-"
      );
    const message =
      "status" in app && app.status?.message ? (
        <Anchorme target="_blank" rel="noreferrer noopener" truncate={20}>
          {app.status.message}
        </Anchorme>
      ) : null;
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
              <EntityIdentifier
                charmId={"charm-url" in app ? app["charm-url"] : null}
                name={key}
              />
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
          content:
            ("workload-version" in app && app["workload-version"]) || "-",
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
          content:
            "status" in app && app.status?.message ? (
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
        className: "",
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
    let columns: MainTableCell[] = [
      {
        content: (
          <Link to={generateUnitURL(modelParams, unitId)}>
            <EntityIdentifier charmId={charm} name={unitId} />
          </Link>
        ),
      },
      {
        content: <Status status={workload} inline />,
        className: "u-capitalise u-truncate",
      },
      { content: agent },
      {
        content: unit["machine-id"],
        className: "u-align--right",
        key: "machine",
      },
      {
        content: generateAddress(publicAddress),
        className: "has-hover",
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
      for (const [key] of Object.entries(subordinates)) {
        const subordinate = subordinates[key];
        const address = subordinate["public-address"];
        const workloadStatus = subordinate["workload-status"].current;
        const columns: MainTableCell[] = [
          {
            content: (
              <Link to={generateUnitURL(modelParams, unitId)}>
                <EntityIdentifier
                  charmId={subordinate["charm-url"]}
                  name={key}
                  subordinate
                />
              </Link>
            ),
            className: "u-truncate",
          },
          {
            content: (
              <Status status={subordinate["workload-status"].current} inline />
            ),
            className: "u-capitalise u-truncate",
          },
          { content: subordinate["agent-status"].current },
          { content: subordinate["machine-id"], className: "u-align--right" },
          { content: generateAddress(address), className: "has-hover" },
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
  machines: MachineData | null,
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
      ? appsOnMachine.map((app) => (
          <CharmIcon
            name={app[0]}
            charmId={app[1]}
            key={`${app[0]}-${app[1]}`}
          />
        ))
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
                <Status
                  status={machine["agent-status"].current}
                  className="p-icon"
                  useIcon
                />
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
              {applications ? (
                <RelationIcon
                  applicationName={
                    providerApplicationName || peerApplicationName
                  }
                  applications={applications}
                />
              ) : null}
              {providerLabel}
            </TruncatedTooltip>
          ),
        },
        {
          content: (
            <TruncatedTooltip message={requirerLabel}>
              {applications ? (
                <RelationIcon
                  applicationName={requirerApplicationName}
                  applications={applications}
                />
              ) : null}
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
    const offer: ApplicationOfferStatus = offers[offerId];
    const endpoints = Object.entries<RemoteEndpoint>(offer.endpoints)
      .map((endpoint) => `${endpoint[1].name}:${endpoint[1].interface}`)
      .join("/n");
    return {
      columns: [
        {
          content: (
            <TruncatedTooltip message={offer["application-name"]}>
              <RelationIcon
                applicationName={offer["application-name"]}
                applications={modelStatusData.applications}
              />
              {offer["application-name"]}
            </TruncatedTooltip>
          ),
        },
        {
          content: (
            <TruncatedTooltip message={endpoints}>{endpoints}</TruncatedTooltip>
          ),
        },
        {
          content: offer["active-connected-count"],
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
              <RelationIcon
                applicationName={offer["application-name"]}
                applications={modelStatusData.applications}
              />
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
    };
  });
}

export function generateConsumedRows(modelStatusData?: ModelData | null) {
  if (!modelStatusData) {
    return [];
  }

  const remoteApplications = modelStatusData["remote-applications"] || {};
  return Object.keys(remoteApplications).map((appName) => {
    const application: RemoteApplicationStatus = remoteApplications[appName];
    const endpoints = Object.entries<RemoteEndpoint>(application.endpoints)
      .map((endpoint) => `${endpoint[1].name}:${endpoint[1].interface}`)
      .join("/n");
    return {
      columns: [
        {
          content: (
            <TruncatedTooltip message={application["offer-name"]}>
              <RelationIcon
                applicationName={application["offer-name"]}
                applications={modelStatusData.applications}
              />
              {application["offer-name"]}
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
