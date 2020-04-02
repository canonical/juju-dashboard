import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMacaroons } from "app/selectors";
import { FitAddon } from "xterm-addon-fit";

import cleanUpTerminal from "./cleanup-terminal";
import setupTerminal from "./setup-terminal";

import "./_terminal.scss";

const Terminal = ({ address, modelName }) => {
  const terminalElement = useRef(null);
  const macaroons = useSelector(getMacaroons);
  const history = useHistory();

  // save default terminal height in the state object
  let [terminalHeight, setTerminalHeight] = useState(200);

  const fitAddonRef = useRef({ current: null });

  const terminalHeaderHeight = 40; // px
  const minimumTerminalHeight = 84; // px

  useEffect(() => {
    // If the model name is found after a juju switch then
    // switch to that route.
    const switchFound = (model) => {
      if (modelName !== model) {
        history.push(`/models/${model}`);
      }
    };
    const creds = { macaroons };
    const fitAddon = new FitAddon();
    const terminalInstance = setupTerminal(
      address,
      creds,
      modelName,
      terminalElement,
      switchFound
    );
    terminalInstance.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    const resize = (e) => {
      const viewPortHeight = window.innerHeight;
      const mousePosition = e.clientY;
      const newTerminalHeight =
        viewPortHeight - mousePosition + terminalHeaderHeight;
      if (newTerminalHeight >= minimumTerminalHeight) {
        setTerminalHeight(newTerminalHeight);
      }
    };

    const addResizeListener = (e) => {
      if (e.target.classList.value === "p-terminal__header") {
        document.addEventListener("mousemove", resize);
      }
    };

    const removeResizeListener = () => {
      document.removeEventListener("mousemove", resize);
    };

    // set resize listeners
    window.addEventListener("mousedown", addResizeListener);
    window.addEventListener("mouseup", removeResizeListener);

    return () => {
      cleanUpTerminal(terminalInstance);
      // remove resize listener
      window.removeEventListener("mousedown", addResizeListener);
      window.removeEventListener("mouseup", removeResizeListener);
    };
    // Because the user can switch the model details UI from within the
    // component the `modelName` passed above will change as the UI
    // updates. This causes the terminal to log in again which is
    // undesirable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // This effect must run after the one above so the terminal fits on first run
    fitAddonRef.current.fit();
  }, [terminalHeight]);

  return (
    <div
      className="p-terminal"
      style={{
        height: `${terminalHeight}px`,
      }}
    >
      <div className="p-terminal__header">
        <span className="p-terminal__handle"></span>
        <span>Juju Terminal</span>
        <div className="p-terminal__toggle">
          <i className="p-icon--contextual-menu">Toggle Terminal visibility</i>
        </div>
      </div>
      <div
        className="p-terminal__shell"
        style={{
          height: `${terminalHeight - terminalHeaderHeight}px`,
        }}
        ref={terminalElement}
      ></div>
    </div>
  );
};

export default Terminal;
