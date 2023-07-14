import { Button, RadioInput } from "@canonical/react-components";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";

import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { getCharms } from "store/juju/selectors";
import "./_charms-panel.scss";

export enum Label {
  TITLE = "Choose applications of charm:",
}

type CharmsQueryParams = {
  panel: string | null;
  charm: string | null;
};

export default function CharmsPanel() {
  const defaultQueryParams: CharmsQueryParams = {
    panel: null,
    charm: null,
  };
  const [, setQueryParams, handleRemovePanelQueryParams] =
    usePanelQueryParams<CharmsQueryParams>(defaultQueryParams);

  const [selectedCharm, setSelectedCharm] = useState<string | null>(null);
  const charms = useSelector(getCharms());
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setQueryParams(
      { panel: "charm-actions", charm: selectedCharm },
      { replace: true }
    );
  };
  return (
    <Panel
      width="narrow"
      panelClassName="charms-panel"
      title={Label.TITLE}
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
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
