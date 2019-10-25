import React, { useState } from "react";
import classNames from "classnames";

import "./_user-icon.scss";

export default function User(props) {
  const [userPanelVisibility, setUserPanelVisibility] = useState(false);

  console.log(props);

  const logOut = e => {
    e.preventDefault();
    console.log("logging out");
    localStorage.removeItem("identity");
    localStorage.removeItem("https://api.jujucharms.com/identity");
    // TODO: Use React Router to redirect correctly
    window.location.href = "/";
  };

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
            <a href="#_" onClick={e => logOut(e)}>
              Log out
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
