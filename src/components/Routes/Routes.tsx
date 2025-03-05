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
import { getConfig, getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import urls from "urls";

export function Routes() {
  const config = useAppSelector(getConfig);
  const isJuju = useAppSelector(getIsJuju);

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

  // These routes are only available for JAAS and the isJuju value can't change
  // at runtime so they are excluded here.
  if (!isJuju) {
    authenticatedRoutes.push(
      {
        path: urls.logs,
        element: <Logs />,
      },
      {
        path: urls.search,
        element: <AdvancedSearch />,
      },
      {
        path: `${urls.permissions}/*`,
        element: <Permissions />,
      },
    );
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
