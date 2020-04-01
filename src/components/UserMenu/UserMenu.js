import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { useDispatch, useStore } from "react-redux";
import { getActiveUserTag } from "app/selectors";

import { logOut } from "app/actions";
import useAnalytics from "hooks/useAnalytics";
import { extractOwnerName } from "app/utils";

import "./_user-menu.scss";

const UserMenu = () => {
  const sendAnalytics = useAnalytics();
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const getState = useStore().getState;
  const activeUser = useSelector(getActiveUserTag);

  useEffect(() => {
    if (isExpanded) {
      sendAnalytics({
        category: "User",
        action: "Opened user panel",
      });
    }
  }, [isExpanded, sendAnalytics]);

  return (
    <div
      className={classNames("user-menu", {
        "is-expanded": isExpanded,
      })}
    >
      <>
        <div
          className="user-menu__header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className="p-icon--user"></i>
          <span className="user-menu__name">
            {activeUser ? extractOwnerName(activeUser) : ""}
          </span>
          <i className="p-icon--contextual-menu"></i>
        </div>
        <ul className="user-menu__options">
          <li>
            <Link className="user-menu__link" to="/settings">
              Settings
            </Link>
          </li>
          <li>
            <Link
              className="user-menu__link"
              to="/"
              onClick={() => dispatch(logOut(getState))}
            >
              Log out
            </Link>
          </li>
        </ul>
      </>
    </div>
  );
};

export default UserMenu;
