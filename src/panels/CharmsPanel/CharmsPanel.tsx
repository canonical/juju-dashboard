import { Button, RadioInput } from "@canonical/react-components";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";

import Panel from "components/Panel";
import { TestId } from "panels/CharmsAndActionsPanel/CharmsAndActionsPanel";
import { getCharms } from "store/juju/selectors";

export enum Label {
  PANEL_TITLE = "Choose applications of charm:",
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
        {charms.map((charm) => (
          <div key={charm.url} className="p-form__group">
            <RadioInput
              id={charm.url}
              label={`${charm.meta?.name} (rev: ${charm.revision})`}
              checked={selectedCharm === charm.url}
              onChange={() => setSelectedCharm(charm.url)}
            />
          </div>
        ))}
      </form>
    </Panel>
  );
}
