import { Chip, Spinner } from "@canonical/react-components";
import classNames from "classnames";
import { useMemo } from "react";
import type { JSX } from "react";

import DataTable from "components/DataTable";
import ModelActions from "components/ModelActions";
import ModelDetailsLink from "components/ModelDetailsLink";
import ModelVersion from "components/ModelVersion";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import {
  getControllerData,
  getDestructionState,
  getModelUpgrades,
} from "store/juju/selectors";
import type { ModelData } from "store/juju/types";
import { getControllerByUUID } from "store/juju/utils/controllers";
import {
  extractOwnerName,
  getModelQualifier,
  getModelStatusGroupData,
} from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import CloudCell from "./CloudCell";
import ModelSummary from "./ModelSummary";
import WarningMessage from "./WarningMessage";
import { getCredential } from "./shared";

type Props = {
  models: ModelData[];
  groupBy?: "cloud" | "owner" | "status";
};

export default function ModelTable({ models, groupBy }: Props): JSX.Element {
  const controllers = useAppSelector(getControllerData);
  const destructionState = useAppSelector(getDestructionState);
  const modelUpgrades = useAppSelector(getModelUpgrades);

  const tableData = useMemo(
    () =>
      models.map((model) => {
        let controller = null;
        if (model.info?.["controller-uuid"]) {
          const info = controllers
            ? getControllerByUUID(controllers, model.info["controller-uuid"])
            : null;

          controller = {
            uuid: model.info["controller-uuid"],
            info,
            name: info?.name ?? null,
            path: (info && "path" in info && info?.path) || null,
            version:
              (info && "agent-version" in info && info?.["agent-version"]) ||
              null,
          };
        }

        return {
          model,
          name: model.model.name,
          uuid: model.uuid,
          qualifier: model.info ? getModelQualifier(model.info) : null,
          controller,
        };
      }),
    [models, controllers],
  );

  const column = useMemo(
    () => DataTable.columnBuilder<(typeof tableData)[number]>(),
    [],
  );

  return (
    <>
      <DataTable
        getKey={(row) => row.uuid}
        groupBy={groupBy}
        data={tableData}
        noRowsMessage="No models"
        columns={{
          status: column({
            header: "Status",
            sortable: true,
            className: "status",
            map: ({ model }) => getModelStatusGroupData(model).highestStatus,
            renderCell: (status) => (
              <Status status={status}>
                <span className="u-capitalise">{status}</span>
              </Status>
            ),
          }),
          name: column({
            header: "Model",
            sortable: true,
            className: "model-info",
            map: ({ uuid, name, qualifier }) => ({
              uuid,
              name,
              qualifier,
            }),
            renderCell: ({ uuid, name, qualifier }, { model }) => {
              const isDying = uuid in destructionState;
              const upgrade =
                uuid in modelUpgrades ? modelUpgrades[uuid] : null;
              const isUpgrading = !!upgrade;

              return (
                <>
                  <div className="model-name-column">
                    {isDying ? (
                      <span className="model-name-column__status u-truncate">
                        Destroying&hellip;
                      </span>
                    ) : null}
                    {isUpgrading ? (
                      <span className="model-name-column__status">
                        <Spinner />
                      </span>
                    ) : null}
                    <div className="model-name-column__name">
                      <TruncatedTooltip message={name}>
                        <ModelDetailsLink
                          className={classNames({
                            "u-text--muted": isDying,
                          })}
                          modelName={name}
                          qualifier={qualifier}
                        >
                          {model.model.name}
                        </ModelDetailsLink>
                        {isUpgrading ? null : (
                          <ModelVersion
                            className="models__version"
                            modelName={name}
                            qualifier={qualifier}
                          />
                        )}
                      </TruncatedTooltip>
                    </div>
                  </div>
                  {isUpgrading ? (
                    <>
                      <ModelVersion
                        modelName={name}
                        qualifier={qualifier}
                        versionOverride={upgrade.currentVersion}
                      />
                      <span className="u-sh1 u-sh1--right">&rarr;</span>
                      <ModelVersion
                        modelName={name}
                        qualifier={qualifier}
                        versionOverride={upgrade.upgradeVersion}
                      />
                    </>
                  ) : null}
                  <WarningMessage model={model} />
                </>
              );
            },
          }),
          summary: column({
            header: "Configuration",
            sortable: true,
            className: "summary",
            map: ({ qualifier }) => ({
              qualifier,
            }),
            renderCell: ({ qualifier }, { model }) => (
              <ModelSummary modelData={model} qualifier={qualifier} />
            ),
          }),
          owner: column({
            header: "Owner",
            sortable: true,
            className: "owner",
            map: ({ qualifier }) =>
              qualifier ? extractOwnerName(qualifier) : null,
          }),
          cloud: column({
            header: "Cloud/Region",
            sortable: true,
            className: "region",
            map: ({ model }) => model.info?.["cloud-tag"],
            renderCell: (_cloudTag, { model }) => <CloudCell model={model} />,
          }),
          credential: column({
            header: "Credential",
            sortable: true,
            className: "credential",
            map: ({ model }) => getCredential(model),
          }),
          controller: column({
            header: "Controller",
            sortable: true,
            className: "controller",
            map: ({ controller }) =>
              controller
                ? {
                    name: controller.name ?? controller.path ?? controller.uuid,
                    version: controller.version,
                  }
                : null,
            renderCell: (controller) => {
              if (!controller) {
                return null;
              }

              return (
                <TruncatedTooltip message={controller.name}>
                  {controller.name}
                  {controller.version ? (
                    <Chip
                      isReadOnly
                      isInline
                      isDense
                      value={controller.version}
                      className="models__version"
                    />
                  ) : null}
                </TruncatedTooltip>
              );
            },
          }),
          actions: column({
            header: "Actions",
            collapse: true,
            align: "right",
            className: "actions",
            map: ({ qualifier, name, uuid }) => ({
              qualifier,
              name,
              uuid,
            }),
            renderCell: ({ qualifier, name, uuid }) =>
              qualifier ? (
                <ModelActions
                  modelUUID={uuid}
                  modelName={name}
                  qualifier={qualifier}
                />
              ) : null,
          }),
        }}
      />
    </>
  );
}
