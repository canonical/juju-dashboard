import React, { useEffect, useState } from "react";

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

  const setDisconnectedPlaceholder = () => {
    setPlaceholder("no web cli backend available");
  };

  const setConnectedPlaceholder = () => {
    setPlaceholder(DEFAULT_PLACEHOLDER);
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    connection.send(
      JSON.stringify({
        user: credentials.user,
        credentials: credentials.password,
        commands: [e.currentTarget.children.command.value],
      })
    );
  };

  useEffect(() => {
    const address = generateAddress(controllerWSHost, modelUUID);
    if (!address) {
      setDisconnectedPlaceholder();
      return;
    } else {
      setConnectedPlaceholder();
    }
    const ws = new WebSocket(address);
    ws.onopen = () => setConnection(ws);
    ws.onclose = () => setDisconnectedPlaceholder;
    ws.onmessage = (e) => {
      console.log(e);
    };
    return () => {
      ws.close();
    };
  }, [controllerWSHost, modelUUID]);

  return (
    <div className="webcli">
      <div className="webcli__output"></div>
      <div className="webcli__input">
        <div className="webcli__input-prompt">$ juju</div>
        <form onSubmit={handleCommandSubmit}>
          <input
            className="webcli__input-input"
            type="text"
            name="command"
            placeholder={placeholder}
          />
        </form>
        <div className="webcli__input-help">
          <i className="p-icon--help is-light" />
        </div>
      </div>
    </div>
  );
};

export default WebCLI;
