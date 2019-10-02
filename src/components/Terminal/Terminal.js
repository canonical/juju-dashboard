import React, { useEffect, useRef } from "react";
import cleanUpTerminal from "./cleanup-terminal";
import setupTerminal from "./setup-terminal";

import "./_terminal.scss";

const Terminal = ({ address, creds, modelUUID }) => {
  const terminalElement = useRef(null);

  useEffect(() => {
    const terminalInstance = setupTerminal(address, creds, terminalElement);
    return cleanUpTerminal(terminalInstance);
  }, [address, creds]);

  return (
    <div className="terminal">
      <div className="terminal-header">Juju Terminal</div>
      <div className="terminal-shell" ref={terminalElement}></div>
    </div>
  );
};

export default Terminal;
