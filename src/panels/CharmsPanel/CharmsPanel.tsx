import { Button, RadioInput, Tooltip } from "@canonical/react-components";
import { useState, type FormEventHandler } from "react";
import { useSelector } from "react-redux";

import Panel from "components/Panel";
import { TestId } from "panels/CharmsAndActionsPanel/CharmsAndActionsPanel";
import { getCharms } from "store/juju/selectors";

import CharmApplicationsDetails from "./CharmApplicationsDetails";

export enum Label {
  PANEL_TITLE = "Choose applications of charm:",
  NO_ACTIONS = "No actions available for this charm!",
}

type Props = {
  onCharmURLChange: (charmURL: string | null) => void;
  onRemovePanelQueryParams: () => void;
  isLoading: boolean;
};

export default function CharmsPanel({
  onCharmURLChange,
  isLoading,
  onRemovePanelQueryParams,
}: Props): JSX.Element {
  const [selectedCharm, setSelectedCharm] = useState<string | null>(null);
  const charms = useSelector(getCharms());

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    onCharmURLChange(selectedCharm);
  };

  return (
    <Panel
      drawer={
        <Button
          disabled={!selectedCharm}
          onClick={() => onCharmURLChange(selectedCharm)}
        >
          Next
        </Button>
      }
      width="narrow"
      data-testid={TestId.PANEL}
      title={Label.PANEL_TITLE}
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      loading={isLoading}
    >
      <form onSubmit={handleSubmit}>
        {charms.map((charm) => {
          const hasActionData =
            !!charm?.actions?.specs &&
            !!Object.keys(charm.actions.specs).length;
          const charmRadioInput = (
            <>
              <RadioInput
                id={charm.url}
                label={`${charm.meta?.name} (rev: ${charm.revision})`}
                checked={selectedCharm === charm.url}
                onChange={
                  hasActionData ? () => setSelectedCharm(charm.url) : undefined
                }
                disabled={!hasActionData}
              />
              <CharmApplicationsDetails charmURL={charm.url} />
            </>
          );
          return (
            <div key={charm.url} className="p-form__group">
              {hasActionData ? (
                charmRadioInput
              ) : (
                <Tooltip message={Label.NO_ACTIONS} position="left">
                  {charmRadioInput}
                </Tooltip>
              )}
            </div>
          );
        })}
      </form>
    </Panel>
  );
}
