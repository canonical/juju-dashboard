import { ReBACAdmin } from "@canonical/rebac-admin";
import type { AxiosError } from "axios";
import type { JSX } from "react";
import { useRef } from "react";
import { NavLink } from "react-router";

import { axiosInstance } from "axios-instance";
import CheckPermissions from "components/CheckPermissions";
import useLogout from "hooks/useLogout";
import { useIsJIMMAdmin } from "juju/api-hooks/permissions";
import { endpoints } from "juju/jimm/api";
import MainContent from "layout/MainContent";
import { isReBACEnabled } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { FeatureFlags } from "types";
import { rebacURLS } from "urls";
import isFeatureFlagEnabled from "utils/isFeatureFlagEnabled";

import { Label, TestId } from "./types";

const navItems = [
  {
    component: NavLink,
    to: rebacURLS.users.index,
    label: <>{Label.USERS}</>,
  },
  {
    component: NavLink,
    to: rebacURLS.groups.index,
    label: <>{Label.GROUPS}</>,
  },
  {
    component: NavLink,
    to: rebacURLS.entitlements,
    label: <>{Label.ENTITLEMENTS}</>,
  },
  {
    component: NavLink,
    to: rebacURLS.resources.index,
    label: <>{Label.RESOURCES}</>,
  },
];

const PermissionsPage = (): JSX.Element => {
  const logout = useLogout();
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const rebacFlagEnabled = isFeatureFlagEnabled(FeatureFlags.REBAC);
  const { permitted, loading } = useIsJIMMAdmin();

  useRef(
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (
          error.response?.status === 401 &&
          // The 'whoami' endpoint is used to check whether the user is
          // authenticated, so don't display the login screen for these requests as
          // that would cause it to be fetched again and cause an infinite loop.
          error.config?.url !== endpoints().whoami
        ) {
          // Handle any unauthenticated requests and display the login screen.
          logout();
          return null;
        }
        return Promise.reject(error);
      },
    ),
  );

  return (
    <CheckPermissions
      allowed={rebacEnabled && rebacFlagEnabled && permitted}
      data-testid={TestId.COMPONENT}
      loading={loading}
    >
      <MainContent
        data-testid={TestId.COMPONENT}
        secondaryNav={{
          title: "Permissions",
          items: [
            {
              className: "menu-one",
              items: navItems,
            },
          ],
        }}
      >
        <ReBACAdmin axiosInstance={axiosInstance} asidePanelId="app-layout" />
      </MainContent>
    </CheckPermissions>
  );
};

export default PermissionsPage;
