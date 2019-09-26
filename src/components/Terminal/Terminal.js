import React, { useEffect, useRef, useState } from "react";
import { Terminal as Xterm } from "xterm";
import { FitAddon as XtermFitAddon } from "xterm-addon-fit";

import "../../../node_modules/xterm/css/xterm.css";
import "./_terminal.scss";

let terminalInstance = new Xterm();
let fitAddon = new XtermFitAddon();

terminalInstance.loadAddon(fitAddon);

const Terminal = () => {
  const [state, setState] = useState();
  const terminalElement = useRef(null);

  useEffect(() => {
    terminalInstance.open(terminalElement.current);
    fitAddon.fit();
    terminalInstance.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-header">Juju Terminal</div>
      <div className="terminal-shell" ref={terminalElement}></div>
    </div>
  );
};

export default Terminal;
