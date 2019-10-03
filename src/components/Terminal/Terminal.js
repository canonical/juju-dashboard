import React, { useEffect, useRef } from "react";
import cleanUpTerminal from "./cleanup-terminal";
import setupTerminal from "./setup-terminal";

import "./_terminal.scss";

const Terminal = ({ address, creds, modelName }) => {
  const terminalElement = useRef(null);

  useEffect(() => {
    const terminalInstance = setupTerminal(
      address,
      creds,
      modelName,
      terminalElement
    );
    return cleanUpTerminal(terminalInstance);
  }, [address, creds, modelName]);

  return (
    <div className="terminal">
      <div className="terminal-header">Juju Terminal</div>
      <div className="terminal-shell" ref={terminalElement}></div>
    </div>
  );
};

export default Terminal;
