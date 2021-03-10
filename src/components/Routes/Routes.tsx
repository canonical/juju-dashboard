import { useEffect } from "react";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";

import Login from "components/LogIn/LogIn";

import ControllersIndex from "pages/ControllersIndex/ControllersIndex";
import ModelsIndex from "pages/ModelsIndex/ModelsIndex";

// Entity Detail pages
import Model from "pages/EntityDetails/Model/Model";
import App from "pages/EntityDetails/App/App";
import Unit from "pages/EntityDetails/Unit/Unit";
import Machine from "pages/EntityDetails/Machine/Machine";

import Settings from "pages/Settings/Settings";
import NotFound from "pages/NotFound/NotFound";

import useAnalytics from "hooks/useAnalytics";

type Path = {
  redirect?: string;
  component?: () => JSX.Element;
};

type Paths = {
  [key: string]: Path;
};

export type EntityDetailsRoute = {
  userName: string;
  modelName: string;
  appName: string;
  unitId: string;
  machineId: string;
};

export const paths: Paths = {
  "/": { redirect: "/models" },
  "/models": { component: ModelsIndex },
  "/models/:userName/:modelName?": { component: Model },
  "/models/:userName/:modelName?/app/:appName?": { component: App },
  "/models/:userName/:modelName?/app/:appName/unit/:unitId?": {
    component: Unit,
  },
  "/models/:userName/:modelName?/machine/:machineId?": { component: Machine },
  "/controllers": { component: ControllersIndex },
  "/settings": { component: Settings },
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

  const routes = Object.entries(paths).map((path) => {
    const Component = path[1].component;
    if (path[1].redirect) {
      return (
        <Route key={path[0]} path={path[0]} exact>
          <Redirect to={path[1].redirect} />
        </Route>
      );
    }
    return (
      <Route key={path[0]} path={path[0]} exact>
        <Login>{Component ? <Component /> : null}</Login>
      </Route>
    );
  });

  return (
    <Switch>
      {routes}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
