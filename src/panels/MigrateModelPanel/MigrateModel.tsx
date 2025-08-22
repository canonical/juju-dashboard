import { Button, Select } from "@canonical/react-components";
import { useState } from "react";

import Panel from "components/Panel";
import useModelStatus from "hooks/useModelStatus";
import { usePanelQueryParams } from "panels/hooks";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import { getMigrationTargets } from "store/juju/selectors";
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

  const controllersList = useAppSelector(getMigrationTargets) || [];

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
          Upgrade Model
        </Button>
      }
      data-testid={MigrateModelTestId.PANEL}
      title={`Upgrade model: ${modelName}`}
      animateMount={false}
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
    >
      <Select
        label="Target Controller"
        defaultValue=""
        options={[
          {
            value: "",
            disabled: true,
            label: "Select an option",
          },
          ...controllersList.map((controller) => ({
            label: controller.name,
            value: controller.name,
          })),
        ]}
        className="migrate-select"
        onChange={(event) => {
          setSelectedController(event.target.value);
          setDisableSubmit(false);
        }}
      />
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
