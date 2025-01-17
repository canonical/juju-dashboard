import { Navigate, createBrowserRouter, RouterProvider } from "react-router";

import CaptureRoutes from "components/CaptureRoutes";
import Login from "components/LogIn";
import AdvancedSearch from "pages/AdvancedSearch";
import ControllersIndex from "pages/ControllersIndex";
import Logs from "pages/Logs";
import ModelDetails from "pages/ModelDetails";
import ModelsIndex from "pages/ModelsIndex";
import PageNotFound from "pages/PageNotFound";
import Permissions from "pages/Permissions";
import {
  isCrossModelQueriesEnabled,
  isAuditLogsEnabled,
  getConfig,
  isReBACEnabled,
  getActiveUserTag,
  getWSControllerURL,
  getIsJuju,
} from "store/general/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";

export function Routes() {
  const crossModelQueriesEnabled = useAppSelector(isCrossModelQueriesEnabled);
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const auditLogsEnabled = useAppSelector(isAuditLogsEnabled);
  const config = useAppSelector(getConfig);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const activeUser = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const isJuju = useAppSelector(getIsJuju);
  const isAuthenticated = !!activeUser;
  // Some JAAS routes require authentication to determine if they should be displayed.
  // To support this we initially include the route which will allow the authentication to
  // occur and then determine if the 404 page should be displayed. Without this
  // the 404 page will be displayed immediately and won't attempt to authenticate.
  const requiresAuthentication = !isJuju && !isAuthenticated;

  const authenticatedRoutes = [
    {
      path: urls.models.index,
      element: <ModelsIndex />,
    },
    {
      path: `${urls.model.index(null)}/*`,
      element: <ModelDetails />,
    },
    {
      path: urls.controllers,
      element: <ControllersIndex />,
    },
  ];

  if (requiresAuthentication || auditLogsEnabled) {
    authenticatedRoutes.push({
      path: urls.logs,
      element: <Logs />,
    });
  }

  if (requiresAuthentication || crossModelQueriesEnabled) {
    authenticatedRoutes.push({
      path: urls.search,
      element: <AdvancedSearch />,
    });
  }

  if (requiresAuthentication || rebacEnabled) {
    authenticatedRoutes.push({
      path: `${urls.permissions}/*`,
      element: <Permissions />,
    });
  }

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <CaptureRoutes />,
        children: [
          {
            path: urls.index,
            element: <Navigate to={urls.models.index} />,
          },
          {
            path: "/",
            element: <Login />,
            children: authenticatedRoutes,
          },
          {
            path: "*",
            element: <PageNotFound />,
          },
        ],
      },
    ],
    { basename: config?.baseAppURL },
  );

  return <RouterProvider router={router} />;
}

export default Routes;
