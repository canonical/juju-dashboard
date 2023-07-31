import { dashboardUpdateAvailable } from "@canonical/jujulib/dist/api/versions";
import { Icon, StatusLabel, Tooltip } from "@canonical/react-components";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import Logo from "components/Logo/Logo";
import UserMenu from "components/UserMenu/UserMenu";
import { getAppVersion, getIsJuju } from "store/general/selectors";
import {
  getControllerData,
  getGroupedModelStatusCounts,
} from "store/juju/selectors";
import type { Controllers } from "store/juju/types";
import urls, { externalURLs } from "urls";

import "./_primary-nav.scss";
import PrimaryNavLink from "./PrimaryNavLink";

const ModelsLink = () => {
  const { blocked: blockedModels } = useSelector(getGroupedModelStatusCounts);
  return (
    <PrimaryNavLink to={urls.models.index} iconName="models" title="Models">
      {blockedModels > 0 && (
        <span className="entity-count is-negative">{blockedModels}</span>
      )}
    </PrimaryNavLink>
  );
};

const ControllersLink = () => {
  const controllers: Controllers | null = useSelector(getControllerData);

  const controllersUpdateCount = useMemo(() => {
    if (!controllers) return 0;
    let count = 0;
    Object.values(controllers).forEach((controller) => {
      controller.forEach((controller) => {
        if ("version" in controller && controller.updateAvailable) {
          count += 1;
        }
      });
    });
    return count;
  }, [controllers]);

  return (
    <PrimaryNavLink
      to={urls.controllers}
      iconName="controllers"
      title="Controllers"
    >
      {controllersUpdateCount > 0 && (
        <span className="entity-count is-caution">
          {controllersUpdateCount}
        </span>
      )}
    </PrimaryNavLink>
  );
};

const LogsLink = () => (
  <PrimaryNavLink to={urls.logs} iconName="topic" title="Logs" />
);

const PrimaryNav = () => {
  const appVersion = useSelector(getAppVersion);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const versionRequested = useRef(false);

  const isJuju = useSelector(getIsJuju);

  useEffect(() => {
    if (appVersion && !versionRequested.current) {
      dashboardUpdateAvailable(appVersion || "")
        ?.then((updateAvailable) => {
          setUpdateAvailable(updateAvailable ?? false);
        })
        .catch(() => {
          setUpdateAvailable(false);
        });
      versionRequested.current = true;
    }
  }, [appVersion]);

  return (
    <nav className="p-primary-nav">
      <div className="p-primary-nav__header">
        <Logo />
      </div>

      <ul className="p-list is-internal">
        <li className="p-list__item">
          <ModelsLink />
        </li>
        <li className="p-list__item">
          <ControllersLink />
        </li>
        {!isJuju && (
          <li className="p-list__item">
            <LogsLink />
          </li>
        )}
      </ul>
      <hr className="p-primary-nav__divider hide-collapsed" />
      <div className="p-primary-nav__bottom hide-collapsed">
        <ul className="p-list">
          <li className="p-list__item">
            <a
              className="p-list__link"
              href={externalURLs.newIssue}
              target="_blank"
              rel="noopener noreferrer"
            >
              Report a bug
            </a>
          </li>
        </ul>
      </div>
      <hr className="p-primary-nav__divider hide-collapsed" />
      <div className="p-primary-nav__bottom hide-collapsed">
        <ul className="p-list">
          <li className="p-list__item">
            <span className="version">
              Version {appVersion}{" "}
              {updateAvailable && (
                <Tooltip message="A new version of the dashboard is available.">
                  <Icon name="warning" data-testid="dashboard-update" />
                </Tooltip>
              )}
            </span>
            <StatusLabel appearance="positive">Beta</StatusLabel>
          </li>
        </ul>
      </div>
      <UserMenu />
    </nav>
  );
};

export default PrimaryNav;
