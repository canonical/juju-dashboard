import React, { useEffect, useMemo, useRef, useState } from "react";

import useAnalytics from "../../hooks/useAnalytics";

import WebCLIOutput from "./Output.js";

import Connection from "./connection";

import "./_webcli.scss";

const DEFAULT_PLACEHOLDER = "enter command";

const WebCLI = ({
  controllerWSHost,
  credentials,
  modelUUID,
  protocol = "wss",
  refreshModel,
}) => {
  const [connection, setConnection] = useState(null);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const [shouldShowHelp, setShouldShowHelp] = useState(false);
  const inputRef = useRef();
  const wsMessageStore = useRef();
  let [output, setOutput] = useState("");
  const sendAnalytics = useAnalytics();

  const setDisconnectedPlaceholder = () => {
    setPlaceholder("no web cli backend available");
  };

  const setConnectedPlaceholder = () => {
    setPlaceholder(DEFAULT_PLACEHOLDER);
  };

  const clearMessageBuffer = () => {
    wsMessageStore.current = "";
    setOutput(""); // Clear the output when sending a new message.
  };

  const wsAddress = useMemo(() => {
    if (!controllerWSHost || !modelUUID) {
      return null;
    }
    return `${protocol}://${controllerWSHost}/model/${modelUUID}/commands`;
  }, [controllerWSHost, modelUUID, protocol]);

  useEffect(() => {
    const conn = new Connection({
      address: wsAddress,
      onopen: setConnectedPlaceholder,
      onclose: setDisconnectedPlaceholder,
      messageCallback: (message) => {
        wsMessageStore.current = wsMessageStore.current + message;
        setOutput(wsMessageStore.current);
      },
    }).connect();
    setConnection(conn);
    return () => {
      // onclose is being set to null when the component is torn down to avoid
      // a react error where the state is being set from the
      // `setDisconnectedPlaceholder` method above.
      conn.onclose = null;
      conn.disconnect();
    };
  }, [wsAddress]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    clearMessageBuffer();
    setShouldShowHelp(false);
    connection.send(
      JSON.stringify({
        user: credentials.user,
        credentials: credentials.password,
        commands: [e.currentTarget.children.command.value],
      })
    );
    sendAnalytics({
      category: "User",
      action: "WebCLI command sent",
    });
    inputRef.current.value = ""; // Clear the input after sending the message.
    setTimeout(() => {
      // Delay the refresh long enough so that the Juju controller has time to
      // respond before we request the updated status.
      refreshModel();
    }, 500);
  };

  const showHelp = () => {
    setShouldShowHelp(true);
  };

  return (
    <div className="webcli">
      <WebCLIOutput
        content={output}
        showHelp={shouldShowHelp}
        setShouldShowHelp={setShouldShowHelp}
        helpMessage={`Welcome to the Juju Web CLI - see the <a href="https://juju.is/docs/webcli" class="p-link--inverted" target="_blank">full documentation here</a>.`}
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
            placeholder={placeholder}
          />
        </form>
        <div className="webcli__input-help">
          <i
            className="p-icon--help is-light"
            onClick={showHelp}
            onKeyDown={showHelp}
            role="button"
            tabIndex="0"
          />
        </div>
      </div>
    </div>
  );
};

export default WebCLI;
