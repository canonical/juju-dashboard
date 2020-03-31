import React, { useEffect } from "react";
import { Route, Redirect, useLocation } from "react-router-dom";

import Controllers from "pages/Controllers/Controllers";
import Logs from "pages/Logs/Logs";
import Models from "pages/Models/Models";
import ModelDetails from "pages/Models/Details/ModelDetails";
import Settings from "pages/Settings/Settings";
import Usage from "pages/Usage/Usage";
import useAnalytics from "hooks/useAnalytics";

export const paths = {
  "/": { redirect: "/models" },
  "/models": { component: Models },
  "/models/*": { component: ModelDetails },
  "/controllers": { component: Controllers },
  "/usage": { component: Usage },
  "/logs": { component: Logs },
  "/settings": { component: Settings }
};

export function Routes() {
  const sendAnalytics = useAnalytics();
  const location = useLocation();

  useEffect(() => {
    // Send an analytics event when the URL changes.
    sendAnalytics({
      path: window.location.href.replace(window.location.origin, "")
    });
  }, [location, sendAnalytics]);

  return Object.entries(paths).map(path => {
    if (path[1].redirect) {
      return (
        <Route key={path[0]} path={path[0]} exact>
          <Redirect to={path[1].redirect} />
        </Route>
      );
    }
    return (
      <Route key={path[0]} path={path[0]} exact component={path[1].component} />
    );
  });
}
