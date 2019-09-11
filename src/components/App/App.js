import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";

// Pages
import Clouds from "pages/Clouds/Clouds";
import Controllers from "pages/Controllers/Controllers";
import Kubernetes from "pages/Kubernetes/Kubernetes";
import Logs from "pages/Logs/Logs";
import Models from "pages/Models/Models";
import ModelDetails from "pages/Models/ModelDetails/ModelDetails";
import NotFound from "pages/NotFound/NotFound";
import Usage from "pages/Usage/Usage";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Switch>
          <Route path="/" exact component={Models} />
          <Route path="/models/:id" exact component={ModelDetails} />
          <Route path="/clouds" exact component={Clouds} />
          <Route path="/kubernetes" exact component={Kubernetes} />
          <Route path="/controllers" exact component={Controllers} />
          <Route path="/usage" exact component={Usage} />
          <Route path="/logs" exact component={Logs} />
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
