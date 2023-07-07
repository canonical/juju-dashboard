import type { Macaroon } from "@canonical/macaroon-bakery/dist/macaroon";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "react-redux";

import useLocalStorage from "hooks/useLocalStorage";
import bakery from "juju/bakery";
import { getActiveUserTag } from "store/general/selectors";
import type { Credential } from "store/general/types";
import { externalURLs } from "urls";

import useAnalytics from "../../hooks/useAnalytics";

import WebCLIOutput from "./Output";
import Connection from "./connection";

import "./_webcli.scss";

type Props = {
  controllerWSHost: string;
  credentials?: Credential | null;
  modelUUID: string;
  protocol?: string;
};

type Authentication = {
  user?: string;
  credentials?: string;
  macaroons?: Macaroon[];
};

export const MAX_HISTORY = 200;

const WebCLI = ({
  controllerWSHost,
  credentials,
  modelUUID,
  protocol = "wss",
}: Props) => {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [shouldShowHelp, setShouldShowHelp] = useState(false);
  const [historyPosition, setHistoryPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsMessageStore = useRef<string>("");
  const [output, setOutput] = useState("");
  const sendAnalytics = useAnalytics();
  const storeState = useStore().getState();
  const [cliHistory, setCLIHistory] = useLocalStorage<string[]>(
    "cliHistory",
    []
  );

  const clearMessageBuffer = () => {
    wsMessageStore.current = "";
    setOutput(""); // Clear the output when sending a new message.
  };
  const keydownListener = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        let newPosition = historyPosition;
        if (event.key === "ArrowUp") {
          if (newPosition < cliHistory.length) {
            newPosition++;
          }
        } else if (event.key === "ArrowDown") {
          if (newPosition > 0) {
            newPosition--;
          }
        }
        setHistoryPosition(newPosition);
        if (inputRef.current) {
          // Position "0" is used for not navigating through the history and
          // values great than 0 are the positions in the history.
          inputRef.current.value =
            newPosition > 0 ? cliHistory[cliHistory.length - newPosition] : "";
        }
      }
    },
    [cliHistory, historyPosition]
  );

  const keyupListener = useCallback((event: KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (inputRef.current) {
        const position = inputRef.current.value.length;
        // Move the cursor to the end of the history value that was just inserted.
        inputRef.current.setSelectionRange(position, position);
      }
    }
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    input?.addEventListener("keydown", keydownListener);
    input?.addEventListener("keyup", keyupListener);
    return () => {
      input?.removeEventListener("keydown", keydownListener);
      input?.removeEventListener("keyup", keyupListener);
    };
  }, [keydownListener, keyupListener]);

  const wsAddress = useMemo(() => {
    if (!controllerWSHost || !modelUUID) {
      return null;
    }
    return `${protocol}://${controllerWSHost}/model/${modelUUID}/commands`;
  }, [controllerWSHost, modelUUID, protocol]);

  useEffect(() => {
    if (!wsAddress) {
      console.error("no websocket address provided");
      return;
    }
    const conn = new Connection({
      address: wsAddress,
      onopen: () => {
        // Unused handler.
      },
      onclose: () => {
        // Unused handler.
      },
      messageCallback: (message: string) => {
        wsMessageStore.current = wsMessageStore.current + message;
        setOutput(wsMessageStore.current);
      },
    }).connect();
    setConnection(conn);
    return () => {
      conn.disconnect();
    };
  }, [wsAddress]);

  const handleCommandSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessageBuffer();
    setShouldShowHelp(false);
    // We need to get the most up to date connection information in the event
    // that the original connection was redirected. This typically happens in
    // a JAAS style environment.
    const authentication: Authentication = {};
    if (credentials && credentials.user && credentials.password) {
      authentication.user = credentials.user;
      authentication.credentials = credentials.password;
    } else {
      // A user name and password were not provided so try and get a macaroon.
      // The macaroon should be already stored as we've already connected to
      // the model for the model status.
      const origin = connection?.address
        ? new URL(connection?.address)?.origin
        : null;
      const macaroons = origin ? bakery.storage.get(origin) : null;
      if (macaroons) {
        const deserialized = JSON.parse(atob(macaroons));
        const originalWSOrigin = wsAddress ? new URL(wsAddress).origin : null;
        const activeUser = getActiveUserTag(
          storeState,
          `${originalWSOrigin}/api`
        );
        authentication.user = activeUser?.replace("user-", "");
        authentication.macaroons = [deserialized];
      } else {
        // XXX Surface error to the user.
        console.error("No authentication information available");
      }
    }

    let command;
    const formFields = e.currentTarget.children;
    if ("command" in formFields) {
      command = (formFields.command as HTMLInputElement).value.trim();
      let history = cliHistory.concat([command]);
      if (history.length > MAX_HISTORY) {
        history = history.slice(-MAX_HISTORY);
      }
      setCLIHistory(history);
      // Reset the position in case the user was navigating through the history.
      setHistoryPosition(0);
    }

    connection?.send(
      JSON.stringify({
        ...authentication,
        commands: [command],
      })
    );
    sendAnalytics({
      category: "User",
      action: "WebCLI command sent",
    });
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the input after sending the message.
    }
  };

  const showHelp = () => {
    setShouldShowHelp(!shouldShowHelp);
  };

  // If we do not have an address then do not try and render the UI.
  if (!wsAddress) {
    return null;
  }

  return (
    <div className="webcli">
      <WebCLIOutput
        content={output}
        showHelp={shouldShowHelp}
        setShouldShowHelp={setShouldShowHelp}
        helpMessage={
          <>
            Welcome to the Juju Web CLI - see the{" "}
            <a
              href={externalURLs.cliHelp}
              className="p-link--inverted"
              rel="noreferrer"
              target="_blank"
            >
              full documentation here
            </a>
            .
          </>
        }
      />
      <div className="webcli__input">
        <div className="webcli__input-prompt">$ juju</div>
        <form onSubmit={handleCommandSubmit}>
          <input
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            className="webcli__input-input"
            type="text"
            name="command"
            ref={inputRef}
            placeholder="enter command"
          />
        </form>
        <div className="webcli__input-help">
          <i
            className="p-icon--help is-light"
            onClick={showHelp}
            onKeyDown={showHelp}
            role="button"
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
};

export default WebCLI;
