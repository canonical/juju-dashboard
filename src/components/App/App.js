import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import Login from "components/LogIn/LogIn";
import { Routes } from "components/Routes/Routes";

// Pages
import NotFound from "pages/NotFound/NotFound";

const baseURL = process.env.REACT_APP_BASE_APP_URL;

function App() {
  return (
    <Router basename={baseURL}>
      <ErrorBoundary>
        <Switch>
          <Login>
            <Routes />
          </Login>
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
