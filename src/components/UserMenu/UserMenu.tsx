import { Icon } from "@canonical/react-components";
import { unwrapResult } from "@reduxjs/toolkit";
import classNames from "classnames";
import { useEffect, useState } from "react";
import reactHotToast from "react-hot-toast";
import { Link } from "react-router-dom";

import ToastCard from "components/ToastCard/ToastCard";
import SideNavigation from "components/upstream/SideNavigation";
import { SideNavigationText } from "components/upstream/SideNavigation";
import { DARK_THEME } from "consts";
import useAnalytics from "hooks/useAnalytics";
import { thunks as appThunks } from "store/app";
import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { extractOwnerName } from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";
import urls from "urls";

import "./_user-menu.scss";

export enum Label {
  LOGOUT_ERROR = "Error when trying to logout.",
}

const UserMenu = () => {
  const sendAnalytics = useAnalytics();
  const dispatch = useAppDispatch();
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
              <SideNavigationText
                icon="user"
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
                onClick: () => {
                  dispatch(appThunks.logOut())
                    .then(unwrapResult)
                    .catch((error) => {
                      reactHotToast.custom((t) => (
                        <ToastCard toastInstance={t} type="negative">
                          {Label.LOGOUT_ERROR}
                        </ToastCard>
                      ));
                      console.error(Label.LOGOUT_ERROR, error);
                    });
                },
              },
            ]}
          />
        </div>
      )}
    </>
  );
};

export default UserMenu;
