import { useEffect } from "react";
import { useSelector, useDispatch, useStore } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import classNames from "classnames";
import { getActiveUserTag, getWSControllerURL } from "app/selectors";

import { logOut } from "app/actions";
import useAnalytics from "hooks/useAnalytics";
import { extractOwnerName } from "app/utils/utils";

import { userMenuActive } from "ui/actions";
import { isUserMenuActive } from "ui/selectors";

import "./_user-menu.scss";

const UserMenu = () => {
  const sendAnalytics = useAnalytics();
  const dispatch = useDispatch();
  const store = useStore();
  const getState = store.getState;
  const activeUser = getActiveUserTag(
    useSelector(getWSControllerURL),
    getState()
  );
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
    <>
      {activeUser && (
        <div
          className={classNames("user-menu", {
            "is-active": isActive,
          })}
        >
          <div
            className="user-menu__header"
            onClick={toggleUserMenuActive}
            onKeyPress={toggleUserMenuActive}
            role="button"
            tabIndex="0"
          >
            <i className="p-icon--user is-light"></i>
            <span className="user-menu__name">
              {activeUser ? extractOwnerName(activeUser) : ""}
            </span>
            <i className="p-icon--chevron-up is-light"></i>
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
                onClick={() => dispatch(logOut(store))}
              >
                Log out
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default UserMenu;
