import { useEffect, useMemo, useState } from "react";

import Spinner from "@canonical/react-components/dist/components/Spinner";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useParams } from "react-router-dom";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";

import BaseLayout from "layout/BaseLayout/BaseLayout";
import Header from "components/Header/Header";
import InfoPanel from "components/InfoPanel/InfoPanel";

import WebCLI from "components/WebCLI/WebCLI";

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

const EntityDetails = ({ activeView, setActiveView, type, children }) => {
  const { modelName } = useParams();

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

  return (
    <BaseLayout>
      <Header>
        <div className="entity-details__header">
          <strong className="entity-details__title">
            {modelStatusData ? modelStatusData.model.name : "..."}
          </strong>
          <div className="entity-details__view-selector">
            {modelStatusData && type === "model" && (
              <ButtonGroup
                buttons={["apps", "integrations", "machines"]}
                label="View:"
                activeButton={activeView}
                setActiveButton={setActiveView}
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
              <InfoPanel />
              {children}
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
