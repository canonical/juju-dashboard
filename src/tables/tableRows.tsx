import type {
  RemoteApplicationStatus,
  RemoteEndpoint,
} from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type { ApplicationOfferStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type {
  ApplicationStatus,
  MachineStatus,
  RelationStatus,
  UnitStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import { Button, Icon } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import cloneDeep from "clone-deep";
import { Field } from "formik";
import type { ReactNode } from "react";
import { Anchorme } from "react-anchorme";
import { Link } from "react-router";

import CharmIcon from "components/CharmIcon/CharmIcon";
import EntityIdentifier from "components/EntityIdentifier/EntityIdentifier";
import RelationIcon from "components/RelationIcon";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import { copyToClipboard } from "components/utils";
import type { StatusData } from "store/juju/selectors";
import type { ModelData } from "store/juju/types";
import {
  extractRevisionNumber,
  extractRelationEndpoints,
} from "store/juju/utils/models";
import {
  getAppScale,
  getMachineApps,
  getParentOrUnit,
} from "store/juju/utils/units";
import { testId } from "testing/utils";
import urls from "urls";
import { parseMachineHardware } from "utils/parseMachineHardware";

export type ModelParams = {
  modelName: string;
  qualifier: string;
};

export type Query = {
  panel?: null | string;
  entity?: null | string;
  activeView?: null | string;
};

type UnitRow = {
  "data-unit": string;
} & MainTableRow;

const generateAddress = (address: null | string = null): ReactNode =>
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
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            // Prevent navigating to the details page:
            event.stopPropagation();
            copyToClipboard(address);
          }}
          type="button"
          hasIcon
        >
          <Icon name="copy">Copy</Icon>
        </Button>
      </div>
    </div>
  ) : (
    "-"
  );

export function generateLocalApplicationRows(
  applicationIds: string[],
  applications: null | Record<string, ApplicationStatus>,
  applicationStatuses: null | StatusData,
  modelParams: ModelParams,
  query?: Query,
): MainTableRow[] {
  if (!applications || !applicationStatuses) {
    return [];
  }

  function getStore(charmURL: string): string {
    if (charmURL) {
      return charmURL.indexOf("local:") === 0 ? "Local" : "Charmhub";
    }
    return "";
  }

  return applicationIds.map((key) => {
    const app = applications[key];
    const rev = extractRevisionNumber(app.charm) ?? "-";
    const store = getStore(app.charm);
    const version =
      ("workload-version" in app && app["workload-version"]) || "-";
    const status =
      "status" in app && app.status ? (
        <Status inline status={applicationStatuses[key]} />
      ) : (
        "-"
      );
    const message =
      "status" in app && app.status?.info ? (
        <Anchorme target="_blank" rel="noreferrer noopener" truncate={20}>
          {app.status.info}
        </Anchorme>
      ) : null;
    const scale = getAppScale(key, applications);
    return {
      columns: [
        {
          "data-test-column": "name",
          content: (
            <Link
              to={urls.model.app.index({
                qualifier: modelParams.qualifier,
                modelName: modelParams.modelName,
                appName: key.replace("/", "-"),
              })}
            >
              <EntityIdentifier charmId={app.charm} name={key} />
            </Link>
          ),
        },
        {
          "data-test-column": "status",
          content: (
            <TruncatedTooltip message={status}>{status}</TruncatedTooltip>
          ),
          className: "u-capitalise u-truncate",
        },
        {
          "data-test-column": "version",
          content:
            ("workload-version" in app && app["workload-version"]) || "-",
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
          "data-test-column": "message",
          content:
            "status" in app && app.status?.info ? (
              <TruncatedTooltip message={message}>{message}</TruncatedTooltip>
            ) : null,
        },
      ],
      sortData: {
        app: key,
        status,
        version,
        scale,
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
): MainTableRow[] {
  if (!modelStatusData) {
    return [];
  }
  const applications = cloneDeep(modelStatusData["remote-applications"]);
  return Object.keys(applications ?? {}).map((key) => {
    const app = applications[key];
    const { status } = app.status;
    const offerUrl = app["offer-url"];

    const interfaces = Object.keys(app?.["relations"]).map(
      (endpointInterface) => endpointInterface,
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
  });
}

const generateUnitURL = (modelParams: ModelParams, unitId: string): string => {
  const id = unitId.replace("/", "-");
  const appName = id?.split("-").slice(0, -1).join("-");
  return urls.model.unit({
    qualifier: modelParams.qualifier,
    modelName: modelParams.modelName,
    appName,
    unitId: id,
  });
};

export function generateUnitRows(
  applications: null | Record<string, ApplicationStatus>,
  units: null | Record<string, UnitStatus>,
  modelParams: ModelParams,
  showCheckbox = false,
  hideMachines = false,
): UnitRow[] {
  if (!units) {
    return [];
  }

  function generatePortsList(ports: UnitStatus["opened-ports"]): string {
    if (!ports || ports.length === 0) {
      return "-";
    }
    return ports.join(", ");
  }

  const unitRows: UnitRow[] = [];
  for (const [unitId, unit] of Object.entries(units)) {
    const app = applications?.[unitId.split("/")[0]];
    const workload = unit["workload-status"].status || "-";
    const agent = unit["agent-status"].status || "-";
    const publicAddress = unit["public-address"];
    const ports = generatePortsList(unit["opened-ports"]);
    const message = unit["workload-status"].info || "-";
    const messageWithLinks = (
      <Anchorme target="_blank" rel="noreferrer noopener" truncate={20}>
        {message}
      </Anchorme>
    );
    const parentUnit = applications
      ? getParentOrUnit(unitId, applications)
      : null;
    const machine = parentUnit?.machine;
    let columns: MainTableCell[] = [
      {
        content: (
          <Link to={generateUnitURL(modelParams, unitId)}>
            <EntityIdentifier
              charmId={unit.charm || app?.charm}
              name={unitId}
            />
          </Link>
        ),
      },
      {
        content: <Status status={workload} inline />,
        className: "u-capitalise u-truncate",
      },
      { content: agent },
      {
        content: machine,
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
              {...testId(fieldID)}
            />
            <span className="p-checkbox__label" id={ariaLabeledBy}>
              <span className="u-off-screen">Select unit {unitId}</span>
            </span>
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
        machine,
        publicAddress,
        ports,
        message,
      },
      "data-unit": unitId,
    });

    const { subordinates } = unit;

    if (subordinates) {
      for (const [key] of Object.entries(subordinates)) {
        const subordinate = subordinates[key];
        const address = subordinate["public-address"];
        const workloadStatus = subordinate["workload-status"].status;
        const subordinateColumns: MainTableCell[] = [
          {
            content: (
              <Link to={generateUnitURL(modelParams, key)}>
                <EntityIdentifier
                  charmId={
                    subordinate.charm ||
                    applications?.[key.split("/")[0]]?.charm
                  }
                  name={key}
                  subordinate
                />
              </Link>
            ),
            className: "u-truncate",
          },
          {
            content: (
              <Status status={subordinate["workload-status"].status} inline />
            ),
            className: "u-capitalise u-truncate",
          },
          { content: subordinate["agent-status"].status },
          { content: subordinate.machine, className: "u-align--right" },
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
          subordinateColumns.splice(0, 0, {
            content: "",
          });
        }

        unitRows.push({
          columns: subordinateColumns,
          // This is using the parent data for sorting so that they stick to
          // their parent while being sorted. This isn't fool-proof but it's
          // the best we have for the current design and table implementation.
          sortData: {
            unit: unitId,
            workload,
            agent,
            machine: unit.machine,
            publicAddress,
            ports,
            message,
          },
          "data-unit": unitId,
        });
      }
    }
  }

  return unitRows;
}

export function generateMachineRows(
  machines: null | Record<string, MachineStatus>,
  applications: null | Record<string, ApplicationStatus>,
  modelParams: ModelParams,
  selectedEntity?: null | string,
): MainTableRow[] {
  if (!machines) {
    return [];
  }

  const generateMachineApps = (
    machineId: string,
    modelApps: null | Record<string, ApplicationStatus>,
  ): ReactNode => {
    const appsOnMachine: [string, string][] = Object.entries(
      modelApps ? getMachineApps(machineId, modelApps) : {},
    ).map(([appId, { charm }]) => [appId, charm]);
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
        parseMachineHardware(machine.hardware)["availability-zone"] ?? "";
      const agentStatus = machine["agent-status"].info;
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
                  qualifier: modelParams.qualifier,
                  modelName: modelParams.modelName,
                  machineId: machineId.replace("/", "-"),
                })}
              >
                {machineId}
              </Link>
            ),
          },
          {
            content: generateMachineApps(machineId, applications),
            className: "machine-app-icons",
          },
          {
            content: (
              <TruncatedTooltip
                message={machine["agent-status"].status}
                position="top-center"
                positionElementClassName="entity-details__machines-status-icon"
              >
                <Status
                  status={machine["agent-status"].status}
                  className="p-icon"
                  useIcon
                />
              </TruncatedTooltip>
            ),
            className: "u-capitalise",
          },
          { content: <TruncatedTooltip message={az}>{az}</TruncatedTooltip> },
          {
            content: (
              <TruncatedTooltip message={machine["instance-id"]}>
                {machine["instance-id"]}
              </TruncatedTooltip>
            ),
          },
          {
            content: (
              <TruncatedTooltip message={message}>{message}</TruncatedTooltip>
            ),
          },
        ],
        sortData: {
          machine: machine.base.channel,
          state: machine["agent-status"]?.status,
          az,
          instanceId: machine["instance-id"],
          message: machine["agent-status"].info,
        },
        "data-machine": machineId,
        className: selectedEntity === machineId ? "is-selected" : "",
      };
    });
}

export function generateRelationRows(
  relationData: null | RelationStatus[],
  applications: null | Record<string, ApplicationStatus>,
): MainTableRow[] {
  if (!relationData) {
    return [];
  }
  return relationData.map((relation) => {
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
        { content: relation.interface },
        { content: relation.endpoints[0]?.role },
      ],
      sortData: {
        provider: providerLabel,
        requirer: requirerLabel,
        interface: relation.interface,
        type: relation.endpoints[0]?.role,
      },
    };
  });
}

export function generateOffersRows(
  modelStatusData: ModelData | null,
): MainTableRow[] {
  if (!modelStatusData) {
    return [];
  }

  const { offers } = modelStatusData;
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
): MainTableRow[] {
  if (!modelStatusData) {
    return [];
  }

  const { offers } = modelStatusData;

  return Object.keys(offers).map((offerId) => {
    const offer = offers[offerId];

    const interfaces = Object.keys(offer?.["endpoints"]).map(
      (endpointInterface) => endpointInterface,
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

export function generateConsumedRows(
  modelStatusData?: ModelData | null,
): MainTableRow[] {
  if (!modelStatusData) {
    return [];
  }

  const remoteApplications = modelStatusData["remote-applications"] ?? {};
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
