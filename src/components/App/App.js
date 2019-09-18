import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Loading from "components/Loading/Loading";

// Pages
const Controllers = React.lazy(() => import("pages/Controllers/Controllers"));
const Logs = React.lazy(() => import("pages/Logs/Logs"));
const Models = React.lazy(() => import("pages/Models/Models"));
const ModelDetails = React.lazy(() =>
  import("pages/Models/Details/ModelDetails")
);
const NotFound = React.lazy(() => import("pages/NotFound/NotFound"));
const Usage = React.lazy(() => import("pages/Usage/Usage"));

function App() {
  return (
    <Router>
      <Switch>
        <Suspense fallback={<Loading />}>
          <Route path="/" exact component={Models} />
          <Route path="/models/:id" exact component={ModelDetails} />
          <Route path="/controllers" exact component={Controllers} />
          <Route path="/usage" exact component={Usage} />
          <Route path="/logs" exact component={Logs} />
          <Route component={NotFound} />
        </Suspense>
      </Switch>
    </Router>
  );
}

export default App;
