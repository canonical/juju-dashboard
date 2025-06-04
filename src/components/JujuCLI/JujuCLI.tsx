import Ansi from "ansi-to-react";
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

const HELP_HEADER = "Starter commands:";

/**
 * Insert docs links around the commands in the help output.
 * The section we're interested looks like the following
 *
 * Starter commands:
 *
 *     bootstrap           Initializes a cloud environment.
 *     add-model           Adds a workload model.
 *
 * @param messages The messages returned by the API.
 * @returns The help nodes.
 */
const processHelp = (messages: string[]) => {
  let inCommandsBlock = false;
  return (
    <>
      {messages.map((message, i) => {
        if (i > 1 && messages[i - 2] === HELP_HEADER) {
          // The header has a blank row between the header and the first command.
          inCommandsBlock = i > 1 && messages[i - 2] === HELP_HEADER;
        } else {
          // End the commands block when we get to a blank row.
          inCommandsBlock = inCommandsBlock && message !== "";
        }
        if (inCommandsBlock) {
          // Get the help command, ignoring the leading whitespace.
          const helpCommand = message.match(/(?<=^\s{2,})\S+(?=\s{2,})/)?.[0];
          // Get the whitespace surrounding the help command so it can be used
          // to reconstruct the output.
          const before = message.match(/^\s+/)?.[0];
          const after = message.match(/(?<=\S)\s{2,}.+/)?.[0];
          // Handle text we don't recognise.
          if (!helpCommand || !before || !after) {
            return (
              <div key={i}>
                <Ansi>{message}</Ansi>
              </div>
            );
          }
          return (
            <div key={i}>
              {before}
              <a
                href={`https://documentation.ubuntu.com/juju/latest/reference/juju-cli/list-of-juju-cli-commands/${helpCommand}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ansi>{helpCommand}</Ansi>
              </a>
              {after}
            </div>
          );
        } else if (!inCommandsBlock || message === "") {
          return (
            <div key={i}>
              <Ansi>{message}</Ansi>
            </div>
          );
        }
      })}
    </>
  );
};

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
      {showWebCLI && controllerWSHost && modelInfo ? (
        <WebCLI
          controllerWSHost={controllerWSHost}
          credentials={credentials}
          modelUUID={modelUUID}
          processOutput={{
            help: {
              // This should match "help" but not "help bootstrap" etc.
              exact: true,
              process: processHelp,
            },
          }}
          protocol={wsProtocol ?? "wss"}
        />
      ) : null}
    </>
  );
};

export default JujuCLI;
