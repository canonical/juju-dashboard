import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import ReactGA from "react-ga";

// Components
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import Login from "components/LogIn/LogIn";
import { Routes } from "components/Routes/Routes";

// Pages
import NotFound from "pages/NotFound/NotFound";

import { getConfig } from "app/selectors";
import useLocalStorage from "hooks/useLocalStorage";

function App() {
  const isProduction = process.env.NODE_ENV === "production" ?? true;
  const { baseAppURL } = useSelector(getConfig);
  const [disableAnalytics] = useLocalStorage("disableAnalytics", false);
  if (isProduction && (!disableAnalytics || disableAnalytics === "false")) {
    ReactGA.initialize("UA-1018242-68");
    ReactGA.pageview(window.location.href.replace(window.location.origin, ""));
  }

  return (
    <Router basename={baseAppURL}>
      <ErrorBoundary>
        <QueryParamProvider ReactRouterRoute={Route}>
          <Switch>
            <Login>
              <Routes />
            </Login>
            <Route component={NotFound} />
          </Switch>
        </QueryParamProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
