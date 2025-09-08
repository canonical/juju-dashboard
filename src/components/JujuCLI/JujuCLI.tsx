import Ansi from "@curvenote/ansi-to-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import WebCLI from "components/WebCLI";
import type { TableLinks } from "components/WebCLI/Output/types";
import useAnalytics from "hooks/useAnalytics";
import {
  getUserPass,
  getIsJuju,
  getActiveUserTag,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCommandHistory,
  getControllerDataByUUID,
  getModelInfo,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";
import { externalURLs } from "urls";
import urls from "urls";
import { getMajorMinorVersion } from "utils";

import { CLICommand } from "./types";

const HELP_HEADER = "Starter commands:";
// Get the help command and surrounding characters from a string in the format:
// "     add-model           Adds a workload model."
const HELP_COMMAND_REGEX = /^(?<before>\s{2,})(?<command>\S+)(?<after>.+)/;

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
        // The first command follows the help header and a blank row.
        const isFirstCommand = i > 1 && messages[i - 2] === HELP_HEADER;
        // Command block continues until an empty row is encountered.
        inCommandsBlock = isFirstCommand || (inCommandsBlock && message !== "");
        if (inCommandsBlock) {
          // Get the help command and surrounding whitespace.
          const matchGroups = message.match(HELP_COMMAND_REGEX)?.groups;
          // Handle text we don't recognise.
          if (!matchGroups) {
            return (
              <div key={i}>
                <Ansi>{message}</Ansi>
              </div>
            );
          }
          const { before, command, after } = matchGroups;
          return (
            <div key={i}>
              {before}
              <a
                href={externalURLs.cliHelpCommand(command)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ansi>{command}</Ansi>
              </a>
              {after}
            </div>
          );
        }
        return (
          <div key={i}>
            <Ansi>{message}</Ansi>
          </div>
        );
      })}
    </>
  );
};

const processOutput = {
  [CLICommand.HELP]: {
    // This should match "help" but not "help bootstrap" etc.
    exact: true,
    process: processHelp,
  },
};

const JujuCLI = () => {
  const routeParams = useParams<EntityDetailsRoute>();
  const sendAnalytics = useAnalytics();
  const dispatch = useAppDispatch();
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
  const wsProtocol = primaryControllerData?.[0].split("://")[0] ?? "wss";
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, primaryControllerData?.[0]),
  );
  const commandHistory = useAppSelector(getCommandHistory);

  function onCommandSent(_command?: string) {
    sendAnalytics({
      category: "User",
      action: "WebCLI command sent",
    });
  }

  const tableLinks = useMemo<TableLinks | null>(
    () =>
      modelInfo
        ? {
            [CLICommand.STATUS]: {
              exact: false,
              blocks: {
                App: {
                  App: (column) => ({
                    link: urls.model.app.index({
                      userName: modelInfo.owner,
                      modelName: modelInfo.name,
                      appName: column.value,
                    }),
                  }),
                },
                Machine: {
                  Machine: (column) => ({
                    link: urls.model.machine({
                      userName: modelInfo.owner,
                      modelName: modelInfo.name,
                      machineId: column.value,
                    }),
                  }),
                  Address: (column) => ({
                    externalLink: `http://${column.value}`,
                  }),
                },
                Model: {
                  Controller: () => ({
                    link: urls.controllers,
                  }),
                  Model: () => ({
                    link: urls.model.index({
                      userName: modelInfo.owner,
                      modelName: modelInfo.name,
                    }),
                  }),
                },
                Unit: {
                  Unit: (column) => {
                    const [appName] = column.value.split("/");
                    return {
                      link: urls.model.unit({
                        userName: modelInfo.owner,
                        modelName: modelInfo.name,
                        appName,
                        unitId: column.value
                          .replaceAll("/", "-")
                          .replaceAll("*", ""),
                      }),
                    };
                  },
                  Machine: (column) => ({
                    link: urls.model.machine({
                      userName: modelInfo.owner,
                      modelName: modelInfo.name,
                      machineId: column.value,
                    }),
                  }),
                  "Public address": (column) => ({
                    externalLink: `http://${column.value}`,
                  }),
                },
              },
            },
          }
        : null,
    [modelInfo],
  );

  useEffect(() => {
    if (isJuju && getMajorMinorVersion(modelInfo?.version) >= 2.9) {
      // The Web CLI is only available in Juju controller versions 2.9 and
      // above. This will allow us to only show the shell on multi-controller
      // setups with different versions where the correct controller version
      // is available.
      setShowWebCLI(true);
    }
  }, [modelInfo, isJuju]);

  if (!showWebCLI || !controllerWSHost || !modelInfo) {
    return null;
  }
  return (
    <WebCLI
      controllerWSHost={controllerWSHost}
      credentials={credentials}
      history={commandHistory}
      modelUUID={modelUUID}
      onCommandSent={onCommandSent}
      onHistoryChange={(uuid, historyItem) =>
        dispatch(
          jujuActions.addCommandHistory({ modelUUID: uuid, historyItem }),
        )
      }
      activeUser={activeUser}
      processOutput={processOutput}
      protocol={wsProtocol}
      tableLinks={tableLinks}
    />
  );
};

export default JujuCLI;
