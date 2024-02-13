import { Button } from "@canonical/react-components";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { isSet } from "components/utils";
import useInlineErrors from "hooks/useInlineErrors";
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
  GET_URL_ERROR = "Unable to get data for selected application(s).",
}

export enum TestId {
  PANEL = "charms-and-actions-panel",
}

enum InlineErrors {
  GET_URL = "get-url",
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
  const getState = useAppStore().getState;
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const [inlineErrors, setInlineErrors, hasInlineError] = useInlineErrors({
    [InlineErrors.GET_URL]: (error) => (
      <>
        {error} Try{" "}
        <Button
          appearance="link"
          onClick={() => {
            getCharmsURL();
          }}
        >
          refetching
        </Button>{" "}
        the charm application(s) data.
      </>
    ),
  });

  // charmURL is initially undefined (isSet(charmURL) is false) and we
  // set its value once we get the information about the charms. Until
  // then, the Panel will be in a loading state.
  const isPanelLoading = !isSet(charmURL);

  const getCharmsURL = useCallback(() => {
    getCharmsURLFromApplications(
      selectedApplications,
      modelUUID,
      getState(),
      dispatch,
    )
      .then((charmsURL) => {
        const isCharmURLUnique = charmsURL.length === 1;
        setCharmURL(isCharmURLUnique ? charmsURL[0] : null);
        setInlineErrors(InlineErrors.GET_URL, null);
        return;
      })
      .catch((error) => {
        setInlineErrors(InlineErrors.GET_URL, Label.GET_URL_ERROR);
        console.error(Label.GET_URL_ERROR, error);
      });
  }, [dispatch, getState, modelUUID, selectedApplications, setInlineErrors]);

  useEffect(() => {
    // getCharmsURLFromApplications should be resolved only once after
    // selectedApplications and modelUUID are initialized. Once it is
    // resolved, the Panel is loaded and we will get an early return
    // at each subsequent call of useEffect.
    if (!selectedApplications || !modelUUID || !isPanelLoading) {
      setInlineErrors(InlineErrors.GET_URL, null);
      return;
    }
    getCharmsURL();
  }, [
    getCharmsURL,
    isPanelLoading,
    modelUUID,
    selectedApplications,
    setInlineErrors,
  ]);

  return (
    <>
      {charmURL ? (
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
        />
      ) : (
        <CharmsPanel
          inlineErrors={inlineErrors}
          onCharmURLChange={setCharmURL}
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
          isLoading={isPanelLoading && !hasInlineError()}
        />
      )}
    </>
  );
};

export default CharmsAndActionsPanel;
