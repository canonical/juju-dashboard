import { useEffect, useMemo, useState, useCallback } from "react";

import { Spinner, Tabs } from "@canonical/react-components";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { useQueryParams, StringParam, withDefault } from "use-query-params";

import BaseLayout from "layout/BaseLayout/BaseLayout";

import Header from "components/Header/Header";
import WebCLI from "components/WebCLI/WebCLI";
import SlidePanel from "components/SlidePanel/SlidePanel";

import ConfigPanel from "panels/ConfigPanel/ConfigPanel";
import RemoteAppsPanel from "panels/RemoteAppsPanel/RemoteAppsPanel";
import OffersPanel from "panels/OffersPanel/OffersPanel";

import {
  getConfig,
  getControllerDataByUUID,
  getModelControllerDataByUUID,
  getModelUUID,
  getUserPass,
} from "app/selectors";

import useModelStatus from "hooks/useModelStatus";
import useWindowTitle from "hooks/useWindowTitle";

import FadeIn from "animations/FadeIn";

import { fetchAndStoreModelStatus } from "juju";
import { fetchModelStatus } from "juju/actions";

import "./_entity-details.scss";

function generatePanelContent(activePanel, entity, panelRowClick) {
  switch (activePanel) {
    case "remoteApps":
      return <RemoteAppsPanel entity={entity} panelRowClick={panelRowClick} />;
    case "offers":
      return <OffersPanel entity={entity} panelRowClick={panelRowClick} />;
  }
}

const EntityDetails = ({ type, children }) => {
  const { userName, modelName } = useParams();
  const history = useHistory();

  const [query, setQuery] = useQueryParams({
    panel: StringParam,
    entity: StringParam,
    activeView: withDefault(StringParam, "apps"),
  });

  const setActiveView = (view) => {
    setQuery({ activeView: view });
  };

  const { panel: activePanel, entity, activeView } = query;
  const closePanelConfig = { panel: undefined, entity: undefined };

  const dispatch = useDispatch();
  const store = useStore();
  const storeState = store.getState();

  const [showWebCLI, setShowWebCLI] = useState(false);

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const modelStatusData = useModelStatus();
  // In a JAAS environment the controllerUUID will be the sub controller not
  // the primary controller UUID that we connect to.
  const controllerUUID = modelStatusData?.info["controller-uuid"];
  // The primary controller data is the controller endpoint we actually connect
  // to. In the case of a normally bootstrapped controller this will be the
  // same as the model controller, however in a JAAS environment, this primary
  // controller will be JAAS and the model controller will be different.
  const primaryControllerData = useSelector(
    getControllerDataByUUID(controllerUUID)
  );
  const modelControllerData = useSelector(
    getModelControllerDataByUUID(controllerUUID)
  );
  let credentials = null;
  let controllerWSHost = "";
  if (primaryControllerData) {
    credentials = getUserPass(primaryControllerData[0], storeState);
    controllerWSHost = primaryControllerData[0]
      .replace("wss://", "")
      .replace("/api", "");
  }

  const showWebCLIConfig = useSelector(getConfig).showWebCLI;

  // Until we switch to the new lib and watcher model we want to trigger a
  // refresh of the model data when a user submits a cli command so that it
  // doesn't look like it did nothing.
  const refreshModel = () => {
    fetchAndStoreModelStatus(
      modelUUID,
      primaryControllerData[0],
      dispatch,
      store.getState
    );
  };

  useEffect(() => {
    // XXX Remove me once we have the 2.9 build.
    if (
      (modelControllerData &&
        modelControllerData.version.indexOf("2.9") !== -1) ||
      showWebCLIConfig
    ) {
      // The Web CLI is only available in Juju controller versions 2.9 and
      // above. This will allow us to only show the shell on multi-controller
      // setups with different versions where the correct controller version
      // is available.
      setShowWebCLI(true);
    }
  }, [modelControllerData, showWebCLIConfig]);

  useEffect(() => {
    if (modelUUID !== null && modelStatusData === null) {
      // This model may not be in the first batch of models that we request
      // status from in the main loop so update the status now.
      dispatch(fetchModelStatus(modelUUID));
    }
  }, [dispatch, modelUUID, modelStatusData]);

  useWindowTitle(
    modelStatusData?.model?.name
      ? `Model: ${modelStatusData.model.name}`
      : "..."
  );

  const panelRowClick = useCallback(
    (entityName, entityPanel) => {
      // This can be removed when all entities are moved to top level aside panels
      if (entityPanel === "apps") {
        history.push(`/models/${userName}/${modelName}/app/${entityName}`);
      } else {
        return setQuery({ panel: entityPanel, entity: entityName });
      }
    },
    [setQuery, history, modelName, userName]
  );

  return (
    <BaseLayout>
      <Header>
        <div className="entity-details__header">
          <Breadcrumb />
          <div className="entity-details__view-selector">
            {modelStatusData && type === "model" && (
              <Tabs
                links={[
                  {
                    active: activeView === "apps",
                    label: "Applications",
                    onClick: (e) => {
                      e.preventDefault();
                      setActiveView("apps");
                    },
                  },
                  {
                    active: activeView === "integrations",
                    label: "Integrations",
                    onClick: (e) => {
                      e.preventDefault();
                      setActiveView("integrations");
                    },
                  },
                  {
                    active: activeView === "machines",
                    label: "Machines",
                    onClick: (e) => {
                      e.preventDefault();
                      setActiveView("machines");
                    },
                  },
                ]}
              />
            )}
          </div>
        </div>
      </Header>
      {!modelStatusData ? (
        <div className="entity-details__loading">
          <Spinner />
        </div>
      ) : (
        <FadeIn isActive={modelStatusData}>
          <div className="l-content">
            <div className="entity-details">
              <>
                {children}
                {activePanel === "config" ? (
                  <ConfigPanel
                    appName={entity}
                    charm={modelStatusData.applications[entity].charm}
                    modelUUID={modelStatusData.uuid}
                    onClose={() => setQuery(closePanelConfig)}
                  />
                ) : (
                  <SlidePanel
                    isActive={activePanel}
                    onClose={() => setQuery(closePanelConfig)}
                    isLoading={!entity}
                    className={`${activePanel}-panel`}
                  >
                    {generatePanelContent(
                      activePanel,
                      entity,
                      panelRowClick,
                      modelStatusData
                    )}
                  </SlidePanel>
                )}
              </>
            </div>
          </div>
        </FadeIn>
      )}
      {showWebCLI && (
        <WebCLI
          controllerWSHost={controllerWSHost}
          credentials={credentials}
          modelUUID={modelUUID}
          refreshModel={refreshModel}
        />
      )}
    </BaseLayout>
  );
};

export default EntityDetails;
