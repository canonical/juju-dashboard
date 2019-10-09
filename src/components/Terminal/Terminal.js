import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getMacaroons } from "app/selectors";

import cleanUpTerminal from "./cleanup-terminal";
import setupTerminal from "./setup-terminal";

import "./_terminal.scss";

const Terminal = ({ address, modelName }) => {
  const terminalElement = useRef(null);
  const macaroons = useSelector(getMacaroons);

  useEffect(() => {
    const creds = { macaroons };
    const terminalInstance = setupTerminal(
      address,
      creds,
      modelName,
      terminalElement
    );

    return cleanUpTerminal(terminalInstance);
  }, [address, macaroons, modelName]);

  return (
    <div className="terminal">
      <div className="terminal-header">Juju Terminal</div>
      <div className="terminal-shell" ref={terminalElement}></div>
    </div>
  );
};

export default Terminal;
