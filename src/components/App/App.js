import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import ReactGA from "react-ga";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import Login from "components/LogIn/LogIn";
import { Routes } from "components/Routes/Routes";

// Pages
import NotFound from "pages/NotFound/NotFound";

import useSendAnalytics from "app/send-analytics-hook";

import { getConfig } from "app/selectors";

function App() {
  const { baseAppURL } = useSelector(getConfig);
  const disableAnalytics = localStorage.getItem("disableAnalytics");
  if (
    process.env.NODE_ENV === "production" &&
    (disableAnalytics === undefined || disableAnalytics === "false")
  ) {
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
    <Router basename={baseAppURL} history={history}>
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
