import { Button, RadioInput } from "@canonical/react-components";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";

import Panel from "components/Panel";
import { TestId } from "panels/CharmsAndActionsPanel/CharmsAndActionsPanel";
import { getCharms } from "store/juju/selectors";

import "./_charms-panel.scss";

export enum Label {
  PANEL_TITLE = "Choose applications of charm:",
}

export enum ClassName {
  PANEL = "charms-panel",
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
      width="narrow"
      panelClassName={ClassName.PANEL}
      data-testid={TestId.PANEL}
      title={Label.PANEL_TITLE}
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      loading={isLoading}
    >
      <div className="p-panel__content p-panel_content--padded">
        <form
          className="p-form u-fixed-width charm-list"
          onSubmit={handleSubmit}
        >
          <div className="charm-list__items">
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
          </div>
          <div className="actions-panel__drawer u-float">
            <Button
              type="submit"
              className="u-float-right"
              disabled={!selectedCharm}
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </Panel>
  );
}
