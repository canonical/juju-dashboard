import { Button, RadioInput } from "@canonical/react-components";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";

import Panel from "components/Panel";
import { getCharms } from "store/juju/selectors";
import "./_charms-panel.scss";

export enum Label {
  TITLE = "Choose applications of charm:",
}

type Props = {
  isLoading: boolean;
  onCharmURLChange: (charmURL: string | null) => void;
};

export default function CharmsPanel({
  isLoading,
  onCharmURLChange,
}: Props): JSX.Element {
  // TODO: Add usePanelQueryParams after getting latest changes from main in
  // order to close the panel correctly.

  const [selectedCharm, setSelectedCharm] = useState<string | null>(null);
  const charms = useSelector(getCharms());
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    onCharmURLChange(selectedCharm);
  };
  return (
    <>
      <Panel
        width="narrow"
        panelClassName="charms-panel"
        title={Label.TITLE}
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
    </>
  );
}
