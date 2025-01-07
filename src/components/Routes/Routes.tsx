import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes as ReactRouterRoutes,
  useLocation,
} from "react-router";

import Login from "components/LogIn";
import useAnalytics from "hooks/useAnalytics";
import AdvancedSearch from "pages/AdvancedSearch";
import ControllersIndex from "pages/ControllersIndex";
import Logs from "pages/Logs";
import ModelDetails from "pages/ModelDetails";
import ModelsIndex from "pages/ModelsIndex";
import PageNotFound from "pages/PageNotFound";
import {
  isCrossModelQueriesEnabled,
  isAuditLogsEnabled,
} from "store/general/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";

export function Routes() {
  const sendAnalytics = useAnalytics();
  const location = useLocation();
  const crossModelQueriesEnabled = useAppSelector(isCrossModelQueriesEnabled);
  const auditLogsEnabled = useAppSelector(isAuditLogsEnabled);

  useEffect(() => {
    // Send an analytics event when the URL changes.
    sendAnalytics({
      path: window.location.href.replace(window.location.origin, ""),
    });
  }, [location, sendAnalytics]);

  return (
    <ReactRouterRoutes>
      <Route path={urls.index} element={<Navigate to={urls.models.index} />} />
      <Route
        path={urls.models.index}
        element={
          <Login>
            <ModelsIndex />
          </Login>
        }
      />
      <Route
        path={`${urls.model.index(null)}/*`}
        element={
          <Login>
            <ModelDetails />
          </Login>
        }
      />
      <Route
        path={urls.controllers}
        element={
          <Login>
            <ControllersIndex />
          </Login>
        }
      />
      <Route path="*" element={<PageNotFound />} />
      {auditLogsEnabled && (
        <Route
          path={urls.logs}
          element={
            <Login>
              <Logs />
            </Login>
          }
        />
      )}
      {crossModelQueriesEnabled && (
        <Route
          path={urls.search}
          element={
            <Login>
              <AdvancedSearch />
            </Login>
          }
        />
      )}
    </ReactRouterRoutes>
  );
}

export default Routes;
