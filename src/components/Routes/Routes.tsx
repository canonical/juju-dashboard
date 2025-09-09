import { Navigate, createBrowserRouter, RouterProvider } from "react-router";

import Login from "components/LogIn";
import BaseLayout from "layout/BaseLayout";
import AdvancedSearch from "pages/AdvancedSearch";
import ControllersIndex from "pages/ControllersIndex";
import Logs from "pages/Logs";
import ModelDetails from "pages/ModelDetails";
import ModelsIndex from "pages/ModelsIndex";
import PageNotFound from "pages/PageNotFound";
import PermissionsPage from "pages/Permissions";
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
        element: <PermissionsPage />,
      },
    );
  }

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <BaseLayout />,
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
