import { useEffect } from "react";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";

import Login from "components/LogIn/LogIn";

import ControllersIndex from "pages/ControllersIndex/ControllersIndex";
import ModelsIndex from "pages/ModelsIndex/ModelsIndex";

// Entity Detail pages
import ModelDetails from "pages/ModelDetails/ModelDetails";

import Settings from "pages/Settings/Settings";

// Error pages
import PageNotFound from "pages/PageNotFound/PageNotFound";

import useAnalytics from "hooks/useAnalytics";

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
    <Switch>
      <Route path="/" exact>
        <Redirect to="/models" />
      </Route>
      <Route path="/models" exact>
        <Login>
          <ModelsIndex />
        </Login>
      </Route>
      <Route path="/models/:userName/:modelName">
        <Login>
          <ModelDetails />
        </Login>
      </Route>
      <Route path="/controllers" exact>
        <Login>
          <ControllersIndex />
        </Login>
      </Route>
      <Route path="/settings" exact>
        <Login>
          <Settings />
        </Login>
      </Route>
      <Route>
        <PageNotFound />
      </Route>
    </Switch>
  );
}
