import type { Macaroon } from "@canonical/macaroon-bakery/dist/macaroon";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "react-redux";

import useAnalytics from "hooks/useAnalytics";
import useInlineErrors from "hooks/useInlineErrors";
import useLocalStorage from "hooks/useLocalStorage";
import bakery from "juju/bakery";
import { getActiveUserTag } from "store/general/selectors";
import type { Credential } from "store/general/types";
import { externalURLs } from "urls";
import { getUserName } from "utils";

import WebCLIOutput from "./Output";
import Connection from "./connection";
import { MAX_HISTORY } from "./consts";
import { Label } from "./types";

enum InlineErrors {
  CONNECTION = "connection",
  AUTHENTICATION = "authentication",
}

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

const WebCLI = ({
  controllerWSHost,
  credentials,
  modelUUID,
  protocol = "wss",
}: Props) => {
  const connection = useRef<Connection | null>(null);
  const [shouldShowHelp, setShouldShowHelp] = useState(false);
  const [historyPosition, setHistoryPosition] = useState(0);
  const [inlineErrors, setInlineError, hasInlineError] = useInlineErrors();
  const inputRef = useRef<HTMLInputElement>(null);
  const wsMessageStore = useRef<string>("");
  const [output, setOutput] = useState("");
  const sendAnalytics = useAnalytics();
  const storeState = useStore().getState();
  const [cliHistory, setCLIHistory] = useLocalStorage<string[]>(
    "cliHistory",
    [],
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
    [cliHistory, historyPosition],
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
      setInlineError(InlineErrors.CONNECTION, Label.CONNECTION_ERROR);
      return;
    }
    setInlineError(InlineErrors.CONNECTION, null);
    // If we have an active WebSocket connection then don't create a new one.
    if (connection.current?.isActive()) {
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
      onerror: (error) => {
        // Only display errors if they're related to the current WebSocket
        // connection.
        if (connection.current?.isWebSocketEqual(conn)) {
          setInlineError(
            InlineErrors.CONNECTION,
            typeof error === "string" ? error : Label.UNKNOWN_ERROR,
          );
        }
      },
      messageCallback: (message: string) => {
        wsMessageStore.current = wsMessageStore.current + message;
        setOutput(wsMessageStore.current);
      },
    }).connect();
    connection.current = conn;
  }, [setInlineError, wsAddress]);

  useEffect(
    () => () => {
      connection.current?.disconnect();
    },
    [],
  );

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
      setInlineError(InlineErrors.AUTHENTICATION, null);
    } else {
      // A user name and password were not provided so try and get a macaroon.
      // The macaroon should be already stored as we've already connected to
      // the model for the model status.
      const origin = connection.current?.address
        ? new URL(connection.current?.address)?.origin
        : null;
      const macaroons = origin ? bakery.storage.get(`${origin}/api`) : null;
      if (macaroons) {
        const deserialized = JSON.parse(atob(macaroons));
        const originalWSOrigin = wsAddress ? new URL(wsAddress).origin : null;
        const activeUser = getActiveUserTag(
          storeState,
          `${originalWSOrigin}/api`,
        );
        authentication.user = activeUser ? getUserName(activeUser) : undefined;
        authentication.macaroons = [deserialized];
      }
      setInlineError(
        InlineErrors.AUTHENTICATION,
        macaroons ? null : Label.AUTHENTICATION_ERROR,
      );
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

    if (connection.current?.isOpen()) {
      connection.current?.send(
        JSON.stringify({
          ...authentication,
          commands: [command],
        }),
      );
      sendAnalytics({
        category: "User",
        action: "WebCLI command sent",
      });
    } else {
      setInlineError(InlineErrors.CONNECTION, Label.NOT_OPEN_ERROR);
    }
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the input after sending the message.
    }
  };

  const showHelp = () => {
    setShouldShowHelp(!shouldShowHelp);
  };

  return (
    <div className="webcli">
      <WebCLIOutput
        content={output}
        showHelp={shouldShowHelp || hasInlineError(InlineErrors.AUTHENTICATION)}
        setShouldShowHelp={setShouldShowHelp}
        helpMessage={
          // If errors exist, display them instead of the default help message.
          hasInlineError() ? (
            <>
              {inlineErrors.map((error) => (
                <div key={error as string}>ERROR: {error}</div>
              ))}
            </>
          ) : (
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
          )
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
            disabled={hasInlineError(InlineErrors.CONNECTION)}
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
