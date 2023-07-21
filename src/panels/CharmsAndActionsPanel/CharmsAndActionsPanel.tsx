import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import CharmIcon from "components/CharmIcon";
import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { isSet } from "components/utils";
import { getCharmsURLFromApplications } from "juju/api";
import CharmActionsPanel from "panels/ActionsPanel/CharmActionsPanel";
import CharmsPanel from "panels/CharmsPanel/CharmsPanel";
import {
  getModelUUIDFromList,
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { useAppStore } from "store/store";

export enum Label {
  CHARMS_PANEL_TITLE = "Choose applications of charm:",
  NONE_SELECTED_TITLE = "You need to select a charm and applications to continue.",
  CHARMS_PANEL_CLASS_NAME = "charms-panel",
  CHARM_ACTIONS_PANEL_CLASS_NAME = "actions-panel",
  NO_SELECTED_CHARM = "no-selected-charm-url",
}

export enum TestId {
  PANEL = "charms-and-actions-panel",
}

const CharmsAndActionsPanel = () => {
  // TODO: Add usePanelQueryParams after getting latest changes from main in
  // order to close the panel correctly.

  const [charmURL, setCharmURL] = useState<string | null>();

  const selectedApplications = useSelector(getSelectedApplications());
  const selectedApplicationsForCharmURL = useSelector(
    getSelectedApplications(charmURL ?? undefined)
  );
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const selectedCharm = useSelector(
    getSelectedCharm(charmURL ?? Label.NO_SELECTED_CHARM)
  );

  const generateCharmActionsPanelTitle = () => {
    if (!selectedApplicationsForCharmURL || !selectedCharm)
      return Label.NONE_SELECTED_TITLE;
    const totalUnits = selectedApplicationsForCharmURL.reduce(
      (total, app) => total + (app["unit-count"] || 0),
      0
    );

    return (
      <h5>
        {selectedCharm?.meta?.name && selectedCharm?.url ? (
          <CharmIcon
            name={selectedCharm.meta.name}
            charmId={selectedCharm.url}
          />
        ) : null}{" "}
        {selectedApplicationsForCharmURL.length}{" "}
        {pluralize(selectedApplicationsForCharmURL.length, "application")} (
        {totalUnits} {pluralize(totalUnits, "unit")}) selected
      </h5>
    );
  };

  useEffect(() => {
    if (!selectedApplications || !modelUUID || isSet(charmURL)) {
      return;
    }
    getCharmsURLFromApplications(
      selectedApplications,
      modelUUID,
      appState,
      dispatch
    ).then((charmsURL) => {
      const isCharmURLUnique = charmsURL.length === 1;
      setCharmURL(isCharmURLUnique ? charmsURL[0] : null);
    });
  }, [appState, charmURL, dispatch, modelUUID, selectedApplications]);

  return (
    <Panel
      width="narrow"
      panelClassName={
        charmURL
          ? Label.CHARM_ACTIONS_PANEL_CLASS_NAME
          : Label.CHARMS_PANEL_CLASS_NAME
      }
      data-testid={TestId.PANEL}
      title={
        charmURL ? generateCharmActionsPanelTitle() : Label.CHARMS_PANEL_TITLE
      }
      loading={charmURL === undefined}
    >
      <>
        {charmURL && <CharmActionsPanel charmURL={charmURL} />}
        {!charmURL && <CharmsPanel onCharmURLChange={setCharmURL} />}
      </>
    </Panel>
  );
};

export default CharmsAndActionsPanel;
