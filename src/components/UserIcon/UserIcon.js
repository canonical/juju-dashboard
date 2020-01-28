import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useDispatch, useStore } from "react-redux";

import { logOut } from "app/actions";

import "./_user-icon.scss";

export default function User() {
  const [userPanelVisibility, setUserPanelVisibility] = useState(false);
  const dispatch = useDispatch();
  const node = useRef();

  useEffect(() => {
    const closePanel = () => {
      setUserPanelVisibility(false);
    };

    const mouseDown = e => {
      // Check if click is outside of user panel
      if (!node.current.contains(e.target)) {
        // If so, close the panel
        closePanel();
      }
    };

    const keyDown = e => {
      if (e.keyCode === 27) {
        // Close panel if Esc keydown detected
        closePanel();
      }
    };

    // Add listener on document to capture click events
    document.addEventListener("mousedown", mouseDown);
    // Add listener on document to capture keydown events
    document.addEventListener("keydown", keyDown);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  const getState = useStore().getState;

  return (
    <div
      className="user-icon"
      onClick={() => setUserPanelVisibility(!userPanelVisibility)}
      onKeyPress={() => setUserPanelVisibility(!userPanelVisibility)}
      ref={node}
      tabIndex={0}
      role="button"
    >
      <i className="p-icon--user">Account icon</i>
      <div
        className={classNames("p-contextual-menu__dropdown", {
          "is-visible": userPanelVisibility
        })}
      >
        <span className="p-contextual-menu__group">
          <a
            href="https://jaas.ai/docs"
            className="p-contextual-menu__link p-link--external"
          >
            Docs
          </a>
          <Link
            className="p-contextual-menu__link"
            to="/"
            onClick={() => dispatch(logOut(getState))}
          >
            Log out
          </Link>
        </span>
      </div>
    </div>
  );
}
