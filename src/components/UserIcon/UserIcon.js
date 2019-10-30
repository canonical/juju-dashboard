import React, { useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

import { logOut } from "app/actions";

import "./_user-icon.scss";

export default function User(props) {
  const [userPanelVisibility, setUserPanelVisibility] = useState(false);

  return (
    <div className="user-icon">
      <i
        className="p-icon--user"
        onClick={() => setUserPanelVisibility(!userPanelVisibility)}
      >
        Account icon
      </i>
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
            <Link to="/" onClick={() => logOut()}>
              Log out
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
