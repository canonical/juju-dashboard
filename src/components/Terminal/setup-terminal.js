import { Terminal as Xterm } from "xterm";
import { FitAddon as XtermFitAddon } from "xterm-addon-fit";

import XtermTerminadoAddon from "./xterm-addon-terminado";

// Define jujushell API operations and codes.
const OP_LOGIN = "login";
const OP_START = "start";
const CODE_OK = "ok"; // eslint-disable-line no-unused-vars
const CODE_ERR = "error";
const UNEXPECTED_CLOSE =
  "Terminal connection unexpectedly closed. " +
  "Close and re-open the terminal window to reconnect.";

const JUJU_SWITCH_REGEX = RegExp(/ctrl:.*->\sctrl:(.*)/, "g");
/**
  Setup the terminal instance.
  @param {String} address The address to connect the websocket to.
  @param {Object} creds The credentials format as extracted from the bakery
    including username, password, or the macaroons for the active user.
  @param {String} modelName The model name to switch to uppon connection,
    if any.
  @param {Object} terminalElement The element in the DOM to render the xterm
    instance into.
  @param {Function} switchFound The function to call with the model name
    if a juju switch command to a different model has been detected.
  @returns {XTerm} The new Xterm terminal instance.
*/
export default function setupTerminal(
  address,
  creds,
  modelName,
  terminalElement,
  switchFound
) {
  let terminalInstance = new Xterm({
    theme: {
      background: "#111",
    },
  });

  const ws = new WebSocket(address);

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        operation: OP_LOGIN,
        username: creds.user,
        password: creds.password,
        macaroons: creds.macaroons,
      })
    );
    ws.send(JSON.stringify({ operation: OP_START }));
  };

  ws.onerror = err => {
    terminalInstance.write("Failed to open Websocket connection");
    console.error(err);
  };

  ws.onclose = evt => {
    // 1000 is the code for a normal closure, anything above that is abnormal.
    if (evt && evt.code > 1000) {
      // It is not a normal closure so we should issue an error.
      terminalInstance.writeln(UNEXPECTED_CLOSE);
      console.log(evt);
    }
  };

  ws.onmessage = evt => {
    const resp = JSON.parse(evt.data);
    if (resp.code === CODE_ERR) {
      console.error(resp.message);
      terminalInstance.write(
        `Error talking to the terminal server: ${resp.message}`
      );
      return;
    }
    switch (resp[0]) {
      case "disconnect":
        // Terminado sends a "disconnect" message when the process it's
        // running exits. When we receive that, we close the terminal.
        // We also have to overwrite the onclose method because the WebSocket
        // isn't properly terminated by terminado and instead a 1006 close
        // code is generated triggering the error notification.
        this.ws.onclose = () => {};
        terminalInstance.writeln(UNEXPECTED_CLOSE);
        break;
      case "setup":
        // Terminado sends a "setup" message after it's fully done setting
        // up on the server side and will be sending the first PS1 to the
        // client.
        const cmd = `juju switch ${modelName}`;
        ws.send(JSON.stringify(["stdin", `${cmd}\n`]));
        break;
      case "stdout":
        const switchValue = JUJU_SWITCH_REGEX.exec(resp[1]);
        if (switchValue !== null) {
          switchFound(switchValue[1]);
        }
    }
  };

  let fitAddon = new XtermFitAddon();
  terminalInstance.loadAddon(fitAddon);
  terminalInstance.loadAddon(new XtermTerminadoAddon(ws));

  terminalInstance.open(terminalElement.current);
  fitAddon.fit();
  terminalInstance.writeln("connecting... ");

  return terminalInstance;
}
