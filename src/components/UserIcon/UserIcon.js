import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logOut } from "app/actions";
import { getBakery } from "app/selectors";

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

  const bakery = useSelector(getBakery);

  return (
    <div
      className="user-icon"
      onClick={() => setUserPanelVisibility(!userPanelVisibility)}
      ref={node}
    >
      <i className="p-icon--user">Account icon</i>
      <div
        className={classNames("user-icon__panel p-card--highlighted", {
          "is-visible": userPanelVisibility
        })}
      >
        <span className="user-icon__panel-arrow"></span>
        <ul className="p-list">
          <li className="p-list__item">
            <a href="#_">Profile</a>
          </li>
          <li className="p-list__item">
            <a href="#_">Help</a>
          </li>
          <li className="p-list__item">
            <Link to="/" onClick={() => dispatch(logOut(bakery))}>
              Log out
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
