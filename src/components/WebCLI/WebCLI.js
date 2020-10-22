import React, { useCallback, useEffect, useRef, useState } from "react";

import WebCLIOutput from "./Output.js";

import "./_webcli.scss";

const DEFAULT_PLACEHOLDER = "enter command";

const generateAddress = (controllerWSHost, modelUUID) => {
  if (!controllerWSHost || !modelUUID) {
    return null;
  }
  return `wss://${controllerWSHost}/model/${modelUUID}/commands`;
};

const WebCLI = ({ controllerWSHost, credentials, modelUUID }) => {
  const [connection, setConnection] = useState(null);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const [shouldShowHelp, setShouldShowHelp] = useState(false);
  const inputRef = useRef();
  const wsMessageStore = useRef();
  let [output, setOutput] = useState("");

  const setDisconnectedPlaceholder = () => {
    setPlaceholder("no web cli backend available");
  };

  const setConnectedPlaceholder = () => {
    setPlaceholder(DEFAULT_PLACEHOLDER);
  };

  /*
    The messageBuffer is required because the websocket returns messages much
    faster than React wants to update the component. Doing this allows us to
    store the messages in a buffer and then set the output every cycle.
  */
  const messageBuffer = useCallback(
    (message) => {
      wsMessageStore.current = wsMessageStore.current + message;
      setTimeout(() => {
        setOutput(wsMessageStore.current);
      });
    },
    [setOutput]
  );

  const clearMessageBuffer = () => {
    wsMessageStore.current = "";
    setOutput(""); // Clear the output when sending a new message.
  };

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
    inputRef.current.value = ""; // Clear the input after sending the message.
  };

  const showHelp = () => {
    setShouldShowHelp(true);
  };

  const handleWSMessage = useCallback(
    (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.done) {
          // This is the last message.
          return;
        }
        if (!data.output) {
          // This is the first message, an empty object and a newline.
          return;
        }
        messageBuffer(`\n${data?.output[0]}`);
      } catch (e) {
        console.log(e);
        // XXX handle the invalid data response
      }
    },
    [messageBuffer]
  );

  useEffect(() => {
    const address = generateAddress(controllerWSHost, modelUUID);
    if (!address) {
      setDisconnectedPlaceholder();
      return;
    } else {
      setConnectedPlaceholder();
    }
    const ws = new WebSocket(address);
    ws.onopen = () => {
      setConnection(ws);
    };
    ws.onclose = setDisconnectedPlaceholder;
    ws.onmessage = handleWSMessage;
    return () => {
      ws.close();
    };
  }, [controllerWSHost, modelUUID, handleWSMessage]);

  return (
    <div className="webcli">
      <WebCLIOutput
        content={output}
        showHelp={shouldShowHelp}
        helpMessage={`Welcome to the Juju Web CLI - see the <a href="https://juju.is/docs/webcli" class="p-link--inverted" target="_blank">full documentation here</a>.`}
      />
      <div className="webcli__input">
        <div className="webcli__input-prompt">$ juju</div>
        <form onSubmit={handleCommandSubmit}>
          <input
            autocomplete="off"
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
