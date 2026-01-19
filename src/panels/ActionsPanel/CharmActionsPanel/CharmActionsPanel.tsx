import { Button } from "@canonical/react-components";
import { useMemo, useRef, useState, type JSX } from "react";

import LoadingHandler from "components/LoadingHandler";
import Panel from "components/Panel";
import { CharmsAndActionsPanelTestId } from "panels/CharmsAndActionsPanel";
import CharmActionsPanelTitle from "panels/CharmsAndActionsPanel/CharmActionsPanelTitle";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import {
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import ActionsList from "../ActionsList";
import type { FormControlRef } from "../ActionsList/types";

import ConfirmationDialog from "./ConfirmationDialog";

export type Props = {
  charmURL: string;
  onRemovePanelQueryParams: () => void;
};

export default function CharmActionsPanel({
  charmURL,
  onRemovePanelQueryParams,
}: Props): JSX.Element {
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);

  const selectedApplications = useAppSelector((state) =>
    getSelectedApplications(state, charmURL),
  );
  const selectedCharm = useAppSelector((state) =>
    getSelectedCharm(state, charmURL),
  );
  const actionData = useMemo(
    () => selectedCharm?.actions?.specs ?? {},
    [selectedCharm],
  );
  const unitCount = Object.values(selectedApplications).reduce(
    (total, app) => total + (Object.keys(app.units ?? {}).length ?? 0),
    0,
  );

  const [validAction, setValidAction] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    name: string;
    properties: Record<string, string>;
  } | null>(null);
  const formControlRef = useRef<FormControlRef>(null);

  function handleSubmit(
    name: string,
    properties: Record<string, boolean | string>,
  ): void {
    setPendingAction({
      name,
      properties: Object.fromEntries(
        // Ensure all values are strings.
        Object.entries(properties).map(([key, value]) => [
          key,
          value.toString(),
        ]),
      ),
    });
    setConfirmType(ConfirmType.SUBMIT);
  }

  function submitSelectedAction(): void {
    // Trigger the corresponding `handleSubmit` by submitting the underlying form.
    void formControlRef.current?.submitForm();
  }

  return (
    <Panel
      drawer={
        <Button
          appearance="positive"
          disabled={!validAction || unitCount === 0}
          onClick={submitSelectedAction}
        >
          Run action
        </Button>
      }
      width="narrow"
      {...testId(CharmsAndActionsPanelTestId.PANEL)}
      title={<CharmActionsPanelTitle charmURL={charmURL} />}
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      animateMount={false}
    >
      <LoadingHandler
        hasData={Object.keys(actionData).length > 0}
        loading={false}
        noDataMessage="This charm has not provided any actions."
      >
        <ActionsList
          actions={actionData}
          onSubmit={handleSubmit}
          onValidate={setValidAction}
          formControlRef={formControlRef}
        />
        {pendingAction ? (
          <ConfirmationDialog
            confirmType={confirmType}
            selectedAction={pendingAction.name}
            selectedApplications={selectedApplications}
            setConfirmType={setConfirmType}
            selectedActionOptionValue={pendingAction.properties}
            onRemovePanelQueryParams={onRemovePanelQueryParams}
          />
        ) : null}
      </LoadingHandler>
    </Panel>
  );
}
