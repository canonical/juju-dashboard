import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import classNames from "classnames";
import { useDispatch, useStore } from "react-redux";
import { getActiveUserTag } from "app/selectors";

import { logOut } from "app/actions";
import useAnalytics from "hooks/useAnalytics";
import { extractOwnerName } from "app/utils";

import { userMenuActive } from "ui/actions";
import { isUserMenuActive } from "ui/selectors";

import "./_user-menu.scss";

const UserMenu = () => {
  const sendAnalytics = useAnalytics();
  const dispatch = useDispatch();
  const getState = useStore().getState;
  const activeUser = useSelector(getActiveUserTag);
  const isActive = useSelector(isUserMenuActive) || false;

  useEffect(() => {
    if (isActive) {
      sendAnalytics({
        category: "User",
        action: "Opened user menu",
      });
    }
  }, [isActive, sendAnalytics]);

  const toggleUserMenuActive = () => dispatch(userMenuActive(!isActive));

  return (
    <div
      className={classNames("user-menu", {
        "is-active": isActive,
      })}
    >
      <>
        <div
          className="user-menu__header"
          onClick={toggleUserMenuActive}
          onKeyPress={toggleUserMenuActive}
          role="button"
          tabIndex="0"
        >
          <i className="p-icon--user"></i>
          <span className="user-menu__name">
            {activeUser ? extractOwnerName(activeUser) : ""}
          </span>
          <i className="p-icon--contextual-menu"></i>
        </div>
        <ul className="p-list user-menu__options">
          <li className="p-list__item">
            <NavLink
              className="user-menu__link p-list__link"
              isActive={(match) => {
                if (match && match.url.includes("settings")) {
                  return true;
                }
              }}
              to="/settings"
              activeClassName="is-selected"
            >
              Settings
            </NavLink>
          </li>
          <li className="p-list__item">
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
