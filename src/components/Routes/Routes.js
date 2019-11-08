import React from "react";
import { Route, Redirect } from "react-router-dom";

import Controllers from "pages/Controllers/Controllers";
import Logs from "pages/Logs/Logs";
import Models from "pages/Models/Models";
import ModelDetails from "pages/Models/Details/ModelDetails";
import Usage from "pages/Usage/Usage";

export const paths = {
  "/": { redirect: "/models" },
  "/models": { component: Models },
  "/models/*": { component: ModelDetails },
  "/controllers": { component: Controllers },
  "/usage": { component: Usage },
  "/logs": { component: Logs }
};

export function Routes() {
  return Object.entries(paths).map(path => {
    if (path[1].redirect) {
      return (
        <Route path={path[0]} exact>
          <Redirect to={path[1].redirect} />
        </Route>
      );
    }
    return <Route path={path[0]} exact component={path[1].component} />;
  });
}
