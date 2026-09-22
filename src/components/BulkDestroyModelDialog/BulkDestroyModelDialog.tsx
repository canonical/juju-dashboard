import {
  ConfirmationModal,
  Icon,
  Input,
  MainTable,
  Tooltip,
} from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useState, useMemo, type JSX } from "react";
import { useDispatch } from "react-redux";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getSelectedModelsForDestruction } from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import filterBoolean from "utils/filterBoolean";
import { formatBulkDestructionData } from "utils/formatBulkDestructionData";

import { Label, TestId } from "./types";

type Props = {
  closePortal: () => void;
  afterConfirmClicked: () => void;
  redirectOnDestroy?: boolean;
};

enum ResourceType {
  APPLICATION = "Application",
  MODEL = "Model",
  MACHINE = "Machine",
  CROSS_MODEL_RELATION = "Cross model relation",
  STORAGE = "Attached storage",
}

const resourceIconMap: Record<ResourceType, string> = {
  [ResourceType.APPLICATION]: "applications",
  [ResourceType.MODEL]: "models",
  [ResourceType.MACHINE]: "machines",
  [ResourceType.CROSS_MODEL_RELATION]: "get-link",
  [ResourceType.STORAGE]: "storage",
};

const formatCrossModelRelations = (
  relations: {
    name: string;
    endpoints: { name: string; interface: string }[];
  }[],
): string[] =>
  relations.map(
    ({ name, endpoints }) =>
      `${name} ${endpoints.map((endpoint) => `${endpoint.name}:${endpoint.interface}`).join(", ")}`,
  );

// Helper to render the resource row
const resourceRow = (
  resources: string[],
  resourceType: ResourceType,
): MainTableRow | null => {
  if (!resources.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <div className="u-flex u-flex-items-center u-flex--gap-x-small">
            <Icon
              name={resourceIconMap[resourceType]}
              className="u-no-margin--right"
            />
            {resources.length} {pluralize(resources.length, resourceType)}
            <Tooltip message={resources.join("\n")} position="right">
              <Icon name="information" />
            </Tooltip>
          </div>
        ),
      },
    ],
  };
};

export default function BulkDestroyModelDialog({
  closePortal,
  afterConfirmClicked,
}: Props): JSX.Element {
  const selectedModels = useAppSelector(getSelectedModelsForDestruction);
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const [confirmInput, setConfirmInput] = useState("");

  const { destroyable, reviewed } = formatBulkDestructionData(selectedModels);
  const destroyableCount = destroyable.length;
  const destructionDataByUUID = useModelDestructionData(
    destroyable.map((model) => model.modelUUID),
  );

  const tableRows = useMemo(() => {
    const applications: string[] = [];
    const machines: string[] = [];
    const crossModelRelations: string[] = [];
    const storageIDs: string[] = [];
    for (const { modelUUID } of destroyable) {
      const data = destructionDataByUUID[modelUUID];
      if (data) {
        applications.push(...data.applications);
        machines.push(...data.machines);
        crossModelRelations.push(
          ...formatCrossModelRelations(data.crossModelRelations),
        );
        storageIDs.push(...data.storageIDs);
      }
    }
    return filterBoolean([
      {
        columns: [
          {
            content: "You will be destroying",
            rowSpan: 5,
            className: "p-text--small-caps",
          },
          {
            content: (
              <div className="u-flex u-flex-items-center u-flex--gap-x-small">
                <Icon
                  name={resourceIconMap[ResourceType.MODEL]}
                  className="u-no-margin--right"
                />
                {destroyableCount}{" "}
                {pluralize(destroyableCount, ResourceType.MODEL)}
                <Tooltip
                  message={destroyable
                    .map(({ modelName }) => modelName)
                    .join("\n")}
                  position="right"
                >
                  <Icon name="information" />
                </Tooltip>
              </div>
            ),
          },
        ],
      },
      resourceRow(applications, ResourceType.APPLICATION),
      resourceRow(machines, ResourceType.MACHINE),
      resourceRow(crossModelRelations, ResourceType.CROSS_MODEL_RELATION),
      resourceRow(storageIDs, ResourceType.STORAGE),
    ]);
  }, [destroyable, destructionDataByUUID, destroyableCount]);

  const expectedConfirmString = `destroy ${destroyableCount} models`;
  const isConfirmValid = confirmInput === expectedConfirmString;

  const handleConfirm = (): void => {
    if (wsControllerURL) {
      dispatch(
        jujuActions.destroyModels({
          models: selectedModels
            .filter(({ skipped }) => !skipped)
            .map(({ modelUUID, modelName }) => ({
              "model-tag": `model-${modelUUID}`,
              ...(destructionDataByUUID[modelUUID]?.hasStorage
                ? { "destroy-storage": true }
                : {}),
              modelUUID,
              modelName,
            })),
          wsControllerURL,
        }),
      );
      afterConfirmClicked();
      closePortal();
    }
  };

  return (
    <ConfirmationModal
      title={<div>Destroy {destroyableCount} models</div>}
      {...testId(TestId.DIALOG)}
      className="bulk-destroy-model-dialog"
      confirmButtonLabel={`Destroy ${destroyableCount} models`}
      confirmButtonDisabled={!isConfirmValid}
      cancelButtonLabel={Label.BACK}
      onConfirm={handleConfirm}
      close={closePortal}
    >
      <div className="u-sh1 u-sh1--right">
        {reviewed.length < destroyableCount ? (
          <div className="u-flex u-flex-items-center u-flex--gap-x-small is-caution">
            <Icon name="warning" />
            {reviewed.length}/{destroyableCount} models have not been reviewed.
          </div>
        ) : null}
        <div className="u-sv1 u-sv1--top">
          By destroying {destroyableCount} models, you will also be destroying
          all applications, machines and storage within. This is irreversible.
        </div>
        <hr className="p-rule u-no-margin--bottom" />
        <MainTable
          {...testId(TestId.MODELS_RESOURCES)}
          rows={tableRows}
          className="p-main-table"
        />
        <hr className="p-rule" />
        <Input
          label={`To destroy the models above, enter "${expectedConfirmString}".`}
          placeholder={expectedConfirmString}
          type="text"
          wrapperClassName="u-sv2"
          value={confirmInput}
          onChange={(ev) => {
            setConfirmInput(ev.target.value);
          }}
          error={
            confirmInput.length > 0 && !isConfirmValid
              ? `Incorrect confirmation, enter "${expectedConfirmString}" to destroy`
              : undefined
          }
        />
      </div>
    </ConfirmationModal>
  );
}
