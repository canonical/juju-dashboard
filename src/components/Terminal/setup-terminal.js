import { Terminal as Xterm } from "xterm";
import { FitAddon as XtermFitAddon } from "xterm-addon-fit";

import XtermJujuAddon from "./xterm-addon-juju";

const UNEXPECTED_CLOSE =
  "Terminal connection unexpectedly closed. " +
  "Close and re-open the terminal window to reconnect.";

/**
  Setup the terminal instance.
  @param {String} address The address to connect the websocket to.
  @param {Object} credentials The credentials as pulled from the store
    in the correct structure for either u/p or macaroon based auth.
  @param {Object} terminalElement The element in the DOM to render the xterm
    instance into.
  @param {Function} switchFound The function to call with the model name
    if a juju switch command to a different model has been detected.
  @returns {XTerm} The new Xterm terminal instance.
*/
export default function setupTerminal(
  address,
  credentials,
  terminalElement,
  switchFound
) {
  let terminalInstance = new Xterm({
    theme: {
      background: "#111",
    },
  });

  const ws = new WebSocket(address);

  ws.onopen = () => {};

  ws.onerror = (err) => {
    terminalInstance.write("Failed to open Websocket connection");
    console.error(err);
  };

  ws.onclose = (evt) => {
    // 1000 is the code for a normal closure, anything above that is abnormal.
    if (evt && evt.code > 1000) {
      // It is not a normal closure so we should issue an error.
      terminalInstance.writeln(UNEXPECTED_CLOSE);
      console.log(evt);
    }
  };

  ws.onmessage = () => {};

  let fitAddon = new XtermFitAddon();
  terminalInstance.loadAddon(fitAddon);
  terminalInstance.loadAddon(new XtermJujuAddon(ws, credentials));

  terminalInstance.open(terminalElement.current);
  fitAddon.fit();
  terminalInstance.writeln("Welcome to the Juju Web CLI.");
  terminalInstance.writeln(
    "Run `help` to see what juju commands are available to you."
  );
  terminalInstance.writeln("Commands do not need to be prefixed with `juju`");
  terminalInstance.prompt = () => {
    terminalInstance.write("\r\n$ ");
  };
  terminalInstance.prompt();

  return terminalInstance;
}
