import { Button, RadioInput } from "@canonical/react-components";
import { useMemo, useState } from "react";

import Panel from "components/Panel";
import useModelStatus from "hooks/useModelStatus";
import { usePanelQueryParams } from "panels/hooks";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import { getControllerData } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import ConfirmationDialog from "./ConfirmationDialog";

import { MigrateModelTestId } from ".";

export default function MigrateModelPanel() {
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);
  const [selectedController, setSelectedController] = useState<string>();
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: string | null;
  }>({
    panel: null,
  });

  const modelStatusData = useModelStatus() || null;

  const controllerUUID = modelStatusData?.info?.["controller-uuid"];

  const controllersData = useAppSelector(getControllerData);

  const controllersList = useMemo(() => {
    const data = controllersData ?? [];

    if (Object.values(data).length === 0) {
      return [];
    }

    return Object.values(data)[0].filter(
      (controller) => controller.uuid !== controllerUUID,
    );
  }, [controllersData, controllerUUID]);

  const modelUUID = modelStatusData?.info?.uuid ?? "";
  const modelName = modelStatusData?.info?.name;

  const handleSubmit = () => {
    setConfirmType(ConfirmType.SUBMIT);
  };

  return (
    <Panel
      drawer={
        <Button
          appearance="positive"
          disabled={disableSubmit}
          onClick={handleSubmit}
        >
          Migrate Model
        </Button>
      }
      width="narrow"
      data-testid={MigrateModelTestId.PANEL}
      title={`Model migration: ${modelName}`}
      animateMount={false}
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
    >
      {controllersList.map(({ name = "name" }) => (
        <RadioInput
          id={name}
          key={name}
          label={name}
          checked={selectedController === name}
          onChange={() => {
            setSelectedController(name);
            setDisableSubmit(false);
          }}
        />
      ))}
      {selectedController ? (
        <ConfirmationDialog
          confirmType={confirmType}
          modelUUID={modelUUID}
          selectedController={selectedController}
          setConfirmType={setConfirmType}
          handleRemovePanelQueryParams={handleRemovePanelQueryParams}
        />
      ) : null}
    </Panel>
  );
}
