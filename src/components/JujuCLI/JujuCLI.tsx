import { useEffect, useState } from "react";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import WebCLI from "components/WebCLI";
import { getUserPass, getIsJuju } from "store/general/selectors";
import {
  getControllerDataByUUID,
  getModelInfo,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { getMajorMinorVersion } from "utils";

const JujuCLI = () => {
  const routeParams = useParams<EntityDetailsRoute>();
  const { userName, modelName } = routeParams;
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const modelInfo = useAppSelector((state) => getModelInfo(state, modelUUID));

  const isJuju = useAppSelector(getIsJuju);

  const [showWebCLI, setShowWebCLI] = useState(false);

  // In a JAAS environment the controllerUUID will be the sub controller not
  // the primary controller UUID that we connect to.
  const controllerUUID = modelInfo?.["controller-uuid"];
  // The primary controller data is the controller endpoint we actually connect
  // to. In the case of a normally bootstrapped controller this will be the
  // same as the model controller, however in a JAAS environment, this primary
  // controller will be JAAS and the model controller will be different.
  const primaryControllerData = useAppSelector((state) =>
    getControllerDataByUUID(state, controllerUUID),
  );
  const credentials = useAppSelector((state) =>
    getUserPass(state, primaryControllerData?.[0]),
  );
  const controllerWSHost =
    primaryControllerData?.[0]
      .replace("ws://", "")
      .replace("wss://", "")
      .replace("/api", "") || null;
  const wsProtocol = primaryControllerData?.[0].split("://")[0];

  useEffect(() => {
    if (isJuju && getMajorMinorVersion(modelInfo?.version) >= 2.9) {
      // The Web CLI is only available in Juju controller versions 2.9 and
      // above. This will allow us to only show the shell on multi-controller
      // setups with different versions where the correct controller version
      // is available.
      setShowWebCLI(true);
    }
  }, [modelInfo, isJuju]);

  return (
    <>
      {showWebCLI && controllerWSHost ? (
        <WebCLI
          controllerWSHost={controllerWSHost}
          credentials={credentials}
          modelUUID={modelUUID}
          protocol={wsProtocol ?? "wss"}
        />
      ) : null}
    </>
  );
};

export default JujuCLI;
