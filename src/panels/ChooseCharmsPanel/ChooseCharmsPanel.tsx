import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { getCharmsURLFromApplications } from "juju/api";
import CharmActionsPanel from "panels/ActionsPanel/CharmActionsPanel";
import CharmsPanel from "panels/CharmsPanel/CharmsPanel";
import {
  getModelUUIDFromList,
  getSelectedApplications,
} from "store/juju/selectors";
import { useAppStore } from "store/store";

const ChooseCharmsPanel = () => {
  // TODO: Add usePanelQueryParams after getting latest changes from main in
  // order to close the panel correctly.

  const [charmURL, setCharmURL] = useState<string | null | undefined>(
    undefined
  );
  console.log(charmURL);

  const selectedApplications = useSelector(getSelectedApplications());
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));

  useEffect(() => {
    (async () => {
      const charmsURL = await getCharmsURLFromApplications(
        selectedApplications,
        modelUUID,
        appState,
        dispatch
      );
      const isCharmURLUnique = charmsURL.length === 1;
      setCharmURL(isCharmURLUnique ? charmsURL[0] : null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!charmURL && (
        <CharmsPanel
          isLoading={charmURL === undefined}
          onCharmURLChange={setCharmURL}
        />
      )}
      {charmURL && <CharmActionsPanel charmURL={charmURL} />}
    </>
  );
};

export default ChooseCharmsPanel;
