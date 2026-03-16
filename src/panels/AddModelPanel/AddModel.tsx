import {
  ActionButton,
  Button,
  Step,
  Stepper,
} from "@canonical/react-components";
import type { JSX } from "react";

import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { testId } from "testing/utils";

import { TestId } from "./types";

type AddModelQueryParams = {
  panel: null | string;
};

export default function AddModel(): JSX.Element {
  const defaultQueryParams: AddModelQueryParams = { panel: null };
  const [_queryParams, _setQueryParams, handleRemovePanelQueryParams] =
    usePanelQueryParams<AddModelQueryParams>(defaultQueryParams);

  return (
    <Panel
      panelClassName="add-model"
      {...testId(TestId.PANEL)}
      wide
      title="Add model"
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
      drawer={
        <>
          <Button onClick={handleRemovePanelQueryParams} appearance="base">
            Cancel
          </Button>
          <ActionButton appearance="positive" onClick={() => {}}>
            Next
          </ActionButton>
        </>
      }
    >
      <Stepper
        variant="horizontal"
        steps={[
          <Step
            key="Step 1"
            title="Mandatory details"
            index={1}
            enabled
            hasProgressLine
            iconName="number"
            handleClick={() => {}}
          />,
          <Step
            key="Step 2"
            title="Configuration & Constraints (optional)"
            index={2}
            enabled={false}
            hasProgressLine={false}
            iconName="number"
            handleClick={() => {}}
          />,
          <Step
            key="Step 3"
            title="Access management (optional)"
            index={3}
            enabled={false}
            hasProgressLine={false}
            iconName="number"
            handleClick={() => {}}
          />,
        ]}
      />
    </Panel>
  );
}
