import {
  Icon,
  SideNavigation,
  SideNavigationText,
} from "@canonical/react-components";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { DARK_THEME } from "consts";
import useAnalytics from "hooks/useAnalytics";
import useLogout from "hooks/useLogout";
import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { extractOwnerName } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import urls from "urls";

import "./_user-menu.scss";

const UserMenu = () => {
  const sendAnalytics = useAnalytics();
  const logout = useLogout();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      sendAnalytics({
        category: "User",
        action: "Opened user menu",
      });
    }
  }, [isActive, sendAnalytics]);

  const toggleUserMenuActive = () => setIsActive(!isActive);

  return (
    <>
      {activeUser && (
        <div
          className={classNames("user-menu", {
            "is-active": isActive,
          })}
        >
          <SideNavigation
            dark={DARK_THEME}
            hasIcons
            items={[
              {
                items: [
                  <SideNavigationText
                    icon="user"
                    key="user"
                    className="user-menu__toggle"
                    onClick={toggleUserMenuActive}
                    onKeyUp={toggleUserMenuActive}
                    role="button"
                    tabIndex={0}
                    status={<Icon name="chevron-up" light />}
                  >
                    {activeUser ? extractOwnerName(activeUser) : ""}
                  </SideNavigationText>,
                  {
                    component: Link,
                    to: urls.index,
                    label: "Log out",
                    onClick: logout,
                  },
                ],
              },
            ]}
          />
        </div>
      )}
    </>
  );
};

export default UserMenu;
