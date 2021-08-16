import { useEffect } from "react";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";

import Login from "components/LogIn/LogIn";
import ModelWatcher from "components/ModelWatcher/ModelWatcher";

import ControllersIndex from "pages/ControllersIndex/ControllersIndex";
import ModelsIndex from "pages/ModelsIndex/ModelsIndex";

// Entity Detail pages
import Model from "pages/EntityDetails/Model/Model";
import App from "pages/EntityDetails/App/App";
import Unit from "pages/EntityDetails/Unit/Unit";
import Machine from "pages/EntityDetails/Machine/Machine";

import Settings from "pages/Settings/Settings";

// Error pages
import PageNotFound from "pages/PageNotFound/PageNotFound";

import useAnalytics from "hooks/useAnalytics";

type Path = {
  redirect?: string;
  component?: () => JSX.Element;
  useWatcher?: boolean;
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
  "/models/:userName/:modelName?": { component: Model, useWatcher: true },
  "/models/:userName/:modelName?/app/:appName?": {
    component: App,
    useWatcher: true,
  },
  "/models/:userName/:modelName?/app/:appName/unit/:unitId?": {
    component: Unit,
    useWatcher: true,
  },
  "/models/:userName/:modelName?/machine/:machineId?": {
    component: Machine,
    useWatcher: true,
  },
  "/controllers": { component: ControllersIndex },
  "/settings": { component: Settings },
};

function generateComponent(path: Path) {
  if (path.component) {
    if (path.useWatcher) {
      return (
        <ModelWatcher>
          <path.component />
        </ModelWatcher>
      );
    }
    return <path.component />;
  }
  return null;
}

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
    if (path[1].redirect) {
      return (
        <Route key={path[0]} path={path[0]} exact>
          <Redirect to={path[1].redirect} />
        </Route>
      );
    }
    return (
      <Route key={path[0]} path={path[0]} exact>
        <Login>{generateComponent(path[1])}</Login>
      </Route>
    );
  });

  return (
    <Switch>
      {routes}
      <Route>
        <PageNotFound />
      </Route>
    </Switch>
  );
}
