import { Route, Switch } from "react-router-dom";

import Model from "pages/EntityDetails/Model/Model";
import App from "pages/EntityDetails/App/App";
import Unit from "pages/EntityDetails/Unit/Unit";
import Machine from "pages/EntityDetails/Machine/Machine";

// import ModelWatcher from "components/ModelWatcher/ModelWatcher";

export default function ModelDetails() {
  return (
    <Switch>
      <Route path="/models/:userName/:modelName" exact>
        <Model />
      </Route>
      <Route path="/models/:userName/:modelName/app/:appName" exact>
        <App />
      </Route>
      <Route
        path="/models/:userName/:modelName/app/:appName/unit/:unitId"
        exact
      >
        <Unit />
      </Route>
      <Route path="/models/:userName/:modelName/machine/:machineId" exact>
        <Machine />
      </Route>
    </Switch>
  );
}
