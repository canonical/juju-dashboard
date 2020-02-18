import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { useDispatch, useStore } from "react-redux";

import { logOut } from "app/actions";
import useSendAnalytics from "app/send-analytics-hook";

import "./_user.scss";

const User = () => {
  const sendAnalytics = useSendAnalytics();
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const getState = useStore().getState;

  useEffect(() => {
    if (isExpanded) {
      sendAnalytics({
        category: "User",
        action: "Opened user panel"
      });
    }
  }, [isExpanded, sendAnalytics]);

  return (
    <div
      className={classNames("user", {
        "is-expanded": isExpanded
      })}
    >
      <div className="user__header" onClick={() => setIsExpanded(!isExpanded)}>
        <i className="p-icon--user"></i>
        {/* @TODO Add user name here */}
        <span className="user__name">Account</span>
        <i className="p-icon--contextual-menu"></i>
      </div>
      <ul className="user__options">
        <li>
          <Link className="user__link" to="/settings">
            Settings
          </Link>
        </li>
        <li>
          <Link
            className="user__link"
            to="/"
            onClick={() => dispatch(logOut(getState))}
          >
            Log out
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default User;
