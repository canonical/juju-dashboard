import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import Login from "components/LogIn/LogIn";

// Pages
import Controllers from "pages/Controllers/Controllers";
import Logs from "pages/Logs/Logs";
import Models from "pages/Models/Models";
import ModelDetails from "pages/Models/Details/ModelDetails";
import NotFound from "pages/NotFound/NotFound";
import Usage from "pages/Usage/Usage";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Switch>
          <Login>
            <Route exact path="/">
              <Redirect to="/models" />
            </Route>
            <Route path="/models" exact component={Models} />
            <Route path="/models/*" exact component={ModelDetails} />
            <Route path="/controllers" exact component={Controllers} />
            <Route path="/usage" exact component={Usage} />
            <Route path="/logs" exact component={Logs} />
          </Login>
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
