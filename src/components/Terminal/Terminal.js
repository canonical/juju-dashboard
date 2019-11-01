import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMacaroons } from "app/selectors";
import classNames from "classnames";

import cleanUpTerminal from "./cleanup-terminal";
import setupTerminal from "./setup-terminal";

import "./_terminal.scss";

const Terminal = ({ address, modelName }) => {
  const terminalElement = useRef(null);
  const macaroons = useSelector(getMacaroons);
  const history = useHistory();

  useEffect(() => {
    // If the model name is found after a juju switch then
    // switch to that route.
    const switchFound = model => {
      if (modelName !== model) {
        history.push(`/models/${model}`);
      }
    };
    const creds = { macaroons };
    const terminalInstance = setupTerminal(
      address,
      creds,
      modelName,
      terminalElement,
      switchFound
    );

    return cleanUpTerminal(terminalInstance);
    // Because the user can switch the model details UI from within the
    // component the `modelName` passed above will change as the UI
    // updates. This causes the terminal to log in again which is
    // undesirable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [terminalVisible, setTerminalVisible] = useState(false);

  return (
    <div
      className={classNames("p-terminal", {
        "is-visible": terminalVisible
      })}
    >
      <div
        className="p-terminal__header"
        onClick={() => setTerminalVisible(!terminalVisible)}
      >
        <span>Juju Terminal</span>
        <div className="p-terminal__toggle">
          <i className="p-icon--contextual-menu">Toggle Terminal visibility</i>
        </div>
      </div>
      <div className="p-terminal__shell" ref={terminalElement}></div>
    </div>
  );
};

export default Terminal;
