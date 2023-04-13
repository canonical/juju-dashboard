import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes as ReactRouterRoutes,
  useLocation,
} from "react-router-dom";

import Login from "components/LogIn/LogIn";
import useAnalytics from "hooks/useAnalytics";
import ControllersIndex from "pages/ControllersIndex/ControllersIndex";
import ModelDetails from "pages/ModelDetails/ModelDetails";
import ModelsIndex from "pages/ModelsIndex/ModelsIndex";
import PageNotFound from "pages/PageNotFound/PageNotFound";
import Settings from "pages/Settings/Settings";
import urls from "urls";

export type EntityDetailsRoute = {
  userName: string;
  modelName: string;
  appName: string;
  unitId: string;
  machineId: string;
};

export function Routes() {
  const sendAnalytics = useAnalytics();
  const location = useLocation();

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
      <Route
        path={urls.settings}
        element={
          <Login>
            <Settings />
          </Login>
        }
      />
      <Route path="*" element={<PageNotFound />} />
    </ReactRouterRoutes>
  );
}
