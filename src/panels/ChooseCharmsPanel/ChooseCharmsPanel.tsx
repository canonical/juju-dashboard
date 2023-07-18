import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import { getCharmsURLFromApplications } from "juju/api";
import CharmActionsPanel from "panels/ActionsPanel/CharmActionsPanel";
import CharmsPanel from "panels/CharmsPanel/CharmsPanel";
import {
  getModelUUIDFromList,
  getSelectedApplications,
} from "store/juju/selectors";
import { useAppStore } from "store/store";

const ChooseCharmsPanel = () => {
  const [queryParams, setQueryParams] = useQueryParams<{
    panel: string | null;
    charm?: string | null;
  }>({
    panel: null,
    charm: undefined,
  });

  const selectedApplications = useSelector(getSelectedApplications());
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));

  const setCharmsURLFromApplications = useCallback(async () => {
    const charmsURL = await getCharmsURLFromApplications(
      selectedApplications,
      modelUUID,
      appState,
      dispatch
    );
    const uniqueCharmURL = charmsURL.length === 1 ? charmsURL[0] : undefined;
    setQueryParams({ charm: uniqueCharmURL ? uniqueCharmURL : null });
  }, [appState, dispatch, modelUUID, selectedApplications, setQueryParams]);

  useEffect(() => {
    setCharmsURLFromApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {queryParams.charm === null && <CharmsPanel />}
      {queryParams.charm && <CharmActionsPanel />}
    </>
  );
};

export default ChooseCharmsPanel;
