import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import ReactGA from "react-ga";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import Login from "components/LogIn/LogIn";
import Usabilla from "components/Usabilla/Usabilla";
import { Routes } from "components/Routes/Routes";

// Pages
import NotFound from "pages/NotFound/NotFound";

import { analyticsEnabled } from "app/utils";
import useSendAnalytics from "app/send-analytics-hook";

const baseURL = process.env.REACT_APP_BASE_APP_URL;

function App() {
  if (analyticsEnabled()) {
    ReactGA.initialize("UA-1018242-68");
    ReactGA.pageview(window.location.href.replace(window.location.origin, ""));
  }

  const history = createBrowserHistory();
  const sendAnalytics = useSendAnalytics();

  history.listen(location => {
    sendAnalytics({
      path: window.location.href.replace(window.location.origin, "")
    });
  });

  return (
    <Router basename={baseURL} history={history}>
      <ErrorBoundary>
        <Switch>
          <Login>
            <Routes />
            <Usabilla />
          </Login>
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
