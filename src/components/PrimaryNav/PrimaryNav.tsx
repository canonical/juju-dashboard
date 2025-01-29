import { dashboardUpdateAvailable } from "@canonical/jujulib/dist/api/versions";
import {
  Icon,
  StatusLabel,
  Tooltip,
  SideNavigation,
  SideNavigationText,
} from "@canonical/react-components";
import type { NavItem } from "@canonical/react-components/dist/components/SideNavigation/SideNavigation";
import { urls as generateReBACURLS } from "@canonical/rebac-admin";
import type { HTMLProps, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { NavLinkProps } from "react-router";
import { NavLink } from "react-router";

import UserMenu from "components/UserMenu/UserMenu";
import { DARK_THEME } from "consts";
import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import {
  getAppVersion,
  isAuditLogsEnabled,
  isCrossModelQueriesEnabled,
  getVisitURLs,
  isReBACEnabled,
  getActiveUserTag,
  getWSControllerURL,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getControllerData,
  getGroupedModelStatusCounts,
  hasReBACPermission,
  isJIMMAdmin,
} from "store/juju/selectors";
import type { Controllers } from "store/juju/types";
import { useAppSelector } from "store/store";
import urls, { externalURLs } from "urls";

import "./_primary-nav.scss";

import { Label } from "./types";

const rebacURLS = generateReBACURLS(urls.permissions);

const useControllersLink = () => {
  const controllers: Controllers | null = useSelector(getControllerData);
  const authenticationRequired =
    (useAppSelector(getVisitURLs)?.length ?? 0) > 0;

  const controllersUpdateCount = useMemo(() => {
    if (!controllers) {
      return 0;
    }
    return Object.values(controllers).reduce(
      (controllersCount, controllerArray) =>
        controllersCount +
        controllerArray.reduce(
          (count, controller) =>
            "version" in controller && controller.updateAvailable
              ? count + 1
              : count,
          0,
        ),
      0,
    );
  }, [controllers]);

  let status: ReactNode = null;
  if (authenticationRequired) {
    status = (
      <span className="entity-count">
        <Icon name="lock-locked" light title="Authentication required" />
      </span>
    );
  } else if (controllersUpdateCount > 0) {
    status = (
      <span className="entity-count is-caution">{controllersUpdateCount}</span>
    );
  }

  return {
    component: NavLink,
    to: urls.controllers,
    icon: "controllers",
    label: "Controllers",
    status,
  };
};

const PrimaryNav = () => {
  const dispatch = useDispatch();
  const appVersion = useSelector(getAppVersion);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const versionRequested = useRef(false);
  const crossModelQueriesEnabled = useAppSelector(isCrossModelQueriesEnabled);
  const auditLogsEnabled = useAppSelector(isAuditLogsEnabled);
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const { blocked: blockedModels } = useSelector(getGroupedModelStatusCounts);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const isJIMMControllerAdmin = useAppSelector(isJIMMAdmin);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const auditLogsPermitted = useAppSelector(
    (state) =>
      activeUser &&
      hasReBACPermission(state, {
        object: activeUser,
        relation: JIMMRelation.AUDIT_LOG_VIEWER,
        target_object: JIMMTarget.JIMM_CONTROLLER,
      }),
  );
  const controllersLink = useControllersLink();
  const rebacAllowed = rebacEnabled && isJIMMControllerAdmin;
  const auditLogsAllowed =
    auditLogsEnabled && auditLogsPermitted && isJIMMControllerAdmin;

  useEffect(() => {
    if (appVersion && !versionRequested.current) {
      dashboardUpdateAvailable(appVersion || "")
        .then((updateAvailable) => setUpdateAvailable(updateAvailable ?? false))
        .catch(() => setUpdateAvailable(false));
      versionRequested.current = true;
    }
  }, [appVersion]);

  useEffect(() => {
    const hasAPIData = wsControllerURL && activeUser;
    // Only check the relation if the controller supports audit logs or ReBAC.
    if (hasAPIData && (rebacEnabled || auditLogsEnabled)) {
      dispatch(
        jujuActions.checkRelation({
          tuple: {
            object: activeUser,
            relation: JIMMRelation.ADMINISTRATOR,
            target_object: JIMMTarget.JIMM_CONTROLLER,
          },
          wsControllerURL,
        }),
      );
    }
  }, [activeUser, auditLogsEnabled, dispatch, rebacEnabled, wsControllerURL]);

  useEffect(() => {
    const hasAPIData = wsControllerURL && activeUser;
    // Only check the relation if the controller supports audit logs.
    if (hasAPIData && auditLogsEnabled) {
      dispatch(
        jujuActions.checkRelation({
          tuple: {
            object: activeUser,
            relation: JIMMRelation.AUDIT_LOG_VIEWER,
            target_object: JIMMTarget.JIMM_CONTROLLER,
          },
          wsControllerURL,
        }),
      );
    }
  }, [activeUser, auditLogsEnabled, dispatch, wsControllerURL]);

  const navigation: NavItem<NavLinkProps>[] = [
    {
      component: NavLink,
      to: urls.models.index,
      icon: "models",
      label: "Models",
      status: blockedModels > 0 && (
        <span className="entity-count is-negative">{blockedModels}</span>
      ),
    },
    controllersLink,
  ];
  if (auditLogsAllowed) {
    navigation.push({
      component: NavLink,
      to: urls.logs,
      icon: "topic",
      label: <>{Label.LOGS}</>,
    });
  }
  if (crossModelQueriesEnabled) {
    navigation.push({
      component: NavLink,
      to: urls.search,
      icon: "search",
      label: <>{Label.ADVANCED_SEARCH}</>,
    });
  }
  if (rebacAllowed) {
    navigation.push({
      component: NavLink,
      icon: "user",
      label: <>{Label.PERMISSIONS}</>,
      to: rebacURLS.users.index,
    });
  }

  const extraNav = [
    {
      href: externalURLs.newIssue,
      label: "Report a bug",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    <SideNavigationText
      key="version"
      status={
        updateAvailable ? (
          <Tooltip message="A new version of the dashboard is available.">
            <Icon name="warning" data-testid="dashboard-update" />
          </Tooltip>
        ) : (
          <StatusLabel appearance="positive">Beta</StatusLabel>
        )
      }
    >
      <span className="version">Version {appVersion}</span>
    </SideNavigationText>,
  ];

  return (
    <>
      <SideNavigation<NavLinkProps | HTMLProps<HTMLAnchorElement>>
        dark={DARK_THEME}
        items={[{ items: navigation }, { items: extraNav }]}
        className="p-primary-nav"
      />
      <UserMenu />
    </>
  );
};

export default PrimaryNav;
