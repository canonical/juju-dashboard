import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "react-redux";

import bakery from "app/bakery";
import { getActiveUserTag } from "store/general/selectors";

import useAnalytics from "../../hooks/useAnalytics";

import WebCLIOutput from "./Output.js";

import Connection from "./connection";

import "./_webcli.scss";

const WebCLI = ({
  controllerWSHost,
  credentials,
  modelUUID,
  protocol = "wss",
}) => {
  const [connection, setConnection] = useState(null);
  const [shouldShowHelp, setShouldShowHelp] = useState(false);
  const inputRef = useRef();
  const wsMessageStore = useRef();
  let [output, setOutput] = useState("");
  const sendAnalytics = useAnalytics();
  const storeState = useStore().getState();

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
    if (!wsAddress) {
      console.error("no websocket address provided");
      return;
    }
    const conn = new Connection({
      address: wsAddress,
      onopen: () => {},
      onclose: () => {},
      messageCallback: (message) => {
        wsMessageStore.current = wsMessageStore.current + message;
        setOutput(wsMessageStore.current);
      },
    }).connect();
    setConnection(conn);
    return () => {
      conn.disconnect();
    };
  }, [wsAddress]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    clearMessageBuffer();
    setShouldShowHelp(false);
    // We need to get the most up to date connection information in the event
    // that the original connection was redirected. This typically happens in
    // a JAAS style environment.
    let authentication = {};
    if (credentials && credentials.user && credentials.password) {
      authentication.user = credentials.user;
      authentication.credentials = credentials.password;
    } else {
      // A user name and password were not provided so try and get a macaroon.
      // The macaroon should be already stored as we've already connected to
      // the model for the model status.
      const origin = new URL(connection.address).origin;
      const macaroons = bakery.storage.get(origin);
      if (macaroons) {
        const deserialized = JSON.parse(atob(macaroons));
        const originalWSOrigin = new URL(wsAddress).origin;
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

    connection.send(
      JSON.stringify({
        ...authentication,
        commands: [e.currentTarget.children.command.value.trim()],
      })
    );
    sendAnalytics({
      category: "User",
      action: "WebCLI command sent",
    });
    inputRef.current.value = ""; // Clear the input after sending the message.
  };

  const showHelp = () => {
    setShouldShowHelp(true);
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
        helpMessage={`Welcome to the Juju Web CLI - see the <a href="https://juju.is/docs/olm/using-the-juju-web-cli" class="p-link--inverted" target="_blank">full documentation here</a>.`}
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
            tabIndex="0"
          />
        </div>
      </div>
    </div>
  );
};

export default WebCLI;
