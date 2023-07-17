import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import useAnalytics from "hooks/useAnalytics";
import { useQueryParams } from "hooks/useQueryParams";
import { getCharmsFromApplications } from "juju/api";
import CharmsPanel from "panels/CharmsPanel/CharmsPanel";
import {
  getModelUUIDFromList,
  getSelectedApplications,
} from "store/juju/selectors";
import { useAppStore } from "store/store";

const ChooseCharmsPanel = () => {
  const [, setQuery] = useQueryParams<{
    panel: string | null;
    charm?: string | null;
  }>({
    panel: null,
  });

  const sendAnalytics = useAnalytics();
  const selectedApplications = useSelector(getSelectedApplications());
  const appState = useAppStore().getState();
  const dispatch = useDispatch();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));

  const [charmsAndIsLoading, setCharmsAndIsLoading] = useState<{
    charms: (Charm | undefined)[];
    isLoading: boolean;
  }>({ charms: [], isLoading: true });
  const charms = charmsAndIsLoading.charms;
  const uniqueCharmURL =
    charms.length === 1 && charms[0]?.url ? charms[0].url : undefined;
  const isLoading = charmsAndIsLoading.isLoading;

  // Using useSelector(getCharms()) for retrieving the charms for the selected
  // applications would simplify the logic bellow. However, I think that if we
  // do so, then we might end up with the issue where isLoading gets setup
  // before charms are updated. In this case we would pass the outdated
  // charms to the second useEffect down bellow.
  const getCharmsForSelectedApplications = useCallback(
    (charms: (Charm | undefined)[]) => {
      return charms.filter((charm) => {
        return selectedApplications.some(
          (application) =>
            charm &&
            "charm-url" in application &&
            application["charm-url"] === charm.url
        );
      });
    },
    [selectedApplications]
  );

  const getCharmsAndSetCharmsAndIsLoading = useCallback(async () => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Run action (button)",
    });
    const allCharms = await getCharmsFromApplications(
      selectedApplications,
      modelUUID,
      appState,
      dispatch
    );
    setCharmsAndIsLoading({
      charms: getCharmsForSelectedApplications(allCharms),
      isLoading: false,
    });
  }, [
    appState,
    dispatch,
    getCharmsForSelectedApplications,
    modelUUID,
    selectedApplications,
    sendAnalytics,
  ]);

  useEffect(() => {
    getCharmsAndSetCharmsAndIsLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && uniqueCharmURL) {
      setQuery(
        { panel: "charm-actions", charm: uniqueCharmURL },
        { replace: true }
      );
    }
  }, [isLoading, setQuery, uniqueCharmURL]);

  return <CharmsPanel loading={isLoading || !!uniqueCharmURL} />;
};

export default ChooseCharmsPanel;
