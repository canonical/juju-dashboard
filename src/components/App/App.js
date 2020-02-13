import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactGA from "react-ga";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import Login from "components/LogIn/LogIn";
import { Routes } from "components/Routes/Routes";

// Pages
import NotFound from "pages/NotFound/NotFound";

const baseURL = process.env.REACT_APP_BASE_APP_URL;

function App() {
  let GAKey = "UA-0000000-00";
  if (
    process.env.NODE_ENV === "production" &&
    !localStorage.getItem("disableAnalytics")
  ) {
    GAKey = "UA-1018242-68";
  }
  // Without initializing all the time the console has warnings about ReactGA
  // initialization falure so we just initialize it with an invalid key.
  ReactGA.initialize(GAKey);
  ReactGA.pageview(window.location.href.replace(window.location.origin, ""));
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
