import React, { useEffect, useState } from "react";

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
  let [output, setOutput] = useState("");

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

  /*
    Handler for the websocket message event.

    This is not in a useCallback because it requires that `output` be defined
    as a dependency but due to the slow update time of react state and the
    rapid message handling (sometimes a new message every 5ms) we have to
    redefine output and concat the output value and let react re-render
    on it's own time. This could potentially cause a race condition where
    some of the console messages are skipped if the component renders at
    just the right time but I have not been able to produce this in practice.
    This also has the side effect of not necessarily rendering on every message
    but that also hasn't proven to be a problem in practice.
  */
  const handleWSMessage = (e) => {
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
      output = `${output}\n${data?.output[0]}`;
      setOutput(output);
    } catch (e) {
      console.log(e);
      // XXX handle the invalid data response
    }
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
    ws.onopen = () => {
      setConnection(ws);
    };
    ws.onclose = setDisconnectedPlaceholder;
    ws.onmessage = handleWSMessage;
    return () => {
      ws.close();
    };
    // The linter complains about handleWSMessage but not any of the other
    // included handlers for some reason. handleWSMessage gets re-declared every
    // render and as such causes this to re-run every render causing an infinite
    // loop which is why it's not included as a dep.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [controllerWSHost, modelUUID]);

  return (
    <div className="webcli">
      <WebCLIOutput content={output} />
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
