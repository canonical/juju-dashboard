import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { isSet } from "components/utils";
import { getCharmsURLFromApplications } from "juju/api";
import CharmActionsPanel from "panels/ActionsPanel/CharmActionsPanel";
import CharmsPanel from "panels/CharmsPanel/CharmsPanel";
import { usePanelQueryParams } from "panels/hooks";
import {
  getModelUUIDFromList,
  getSelectedApplications,
} from "store/juju/selectors";
import { useAppStore } from "store/store";

export enum Label {
  GET_URL_ERROR = "Error while trying to get charms url from applications",
}

export enum TestId {
  PANEL = "charms-and-actions-panel",
}

type CharmsAndActionsQueryParams = {
  panel: string | null;
};

const CharmsAndActionsPanel = () => {
  const [charmURL, setCharmURL] = useState<string | null>();
  const defaultQueryParams: CharmsAndActionsQueryParams = {
    panel: null,
  };
  const [, , handleRemovePanelQueryParams] =
    usePanelQueryParams<CharmsAndActionsQueryParams>(defaultQueryParams);

  const selectedApplications = useSelector(getSelectedApplications());
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));

  // charmURL is initially undefined (isSet(charmURL) is false) and we
  // set its value once we get the information about the charms. Until
  // then, the Panel will be in a loading state.
  const isPanelLoading = !isSet(charmURL);

  useEffect(() => {
    // getCharmsURLFromApplications should be resolved only once after
    // selectedApplications and modelUUID are initialized. Once it is
    // resolved, the Panel is loaded and we will get an early return
    // at each subsequent call of useEffect.
    if (!selectedApplications || !modelUUID || !isPanelLoading) {
      return;
    }
    getCharmsURLFromApplications(
      selectedApplications,
      modelUUID,
      appState,
      dispatch
    )
      .then((charmsURL) => {
        const isCharmURLUnique = charmsURL.length === 1;
        setCharmURL(isCharmURLUnique ? charmsURL[0] : null);
        return;
      })
      .catch((error) => console.error(Label.GET_URL_ERROR, error));
  }, [appState, dispatch, isPanelLoading, modelUUID, selectedApplications]);

  return (
    <>
      {charmURL ? (
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
        />
      ) : (
        <CharmsPanel
          onCharmURLChange={setCharmURL}
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
          isLoading={isPanelLoading}
        />
      )}
    </>
  );
};

export default CharmsAndActionsPanel;
