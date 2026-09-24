import {
  ConfirmationModal,
  Icon,
  Input,
  MainTable,
} from "@canonical/react-components";
import { useState, useMemo, type JSX } from "react";
import { useDispatch } from "react-redux";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getSelectedModelsForDestruction } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import filterBoolean from "utils/filterBoolean";
import { formatBulkDestructionData } from "utils/formatBulkDestructionData";

import ResourceCount, { ResourceType } from "./ResourceCount";
import { Label, TestId } from "./types";

type Props = {
  closePortal: () => void;
  afterConfirmClicked: () => void;
  redirectOnDestroy?: boolean;
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
    const resourceRows = destroyable.reduce<[ResourceType, string[]][]>(
      (acc, { modelUUID }) => {
        const data = destructionDataByUUID[modelUUID];
        if (data) {
          acc[0][1].push(...data.applications);
          acc[1][1].push(...data.machines);
          acc[2][1].push(
            ...formatCrossModelRelations(data.crossModelRelations),
          );
          acc[3][1].push(...data.storageIDs);
        }
        return acc;
      },
      [
        [ResourceType.APPLICATION, []],
        [ResourceType.MACHINE, []],
        [ResourceType.CROSS_MODEL_RELATION, []],
        [ResourceType.STORAGE, []],
      ],
    );
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
              <ResourceCount
                resourceType={ResourceType.MODEL}
                resources={destroyable.map(({ modelName }) => modelName)}
              />
            ),
          },
        ],
      },
      ...resourceRows.map(([resourceType, resources]) =>
        resources.length
          ? {
              columns: [
                {
                  content: (
                    <ResourceCount
                      resourceType={resourceType}
                      resources={resources}
                    />
                  ),
                },
              ],
            }
          : null,
      ),
    ]);
  }, [destroyable, destructionDataByUUID]);

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
