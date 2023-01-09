import { useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { initialize, pageview } from "react-ga";

import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";

import { Routes } from "components/Routes/Routes";

import { getConfig } from "store/general/selectors";
import useLocalStorage from "hooks/useLocalStorage";

import "../../scss/index.scss";

function App() {
  const isProduction = process.env.NODE_ENV === "production" ?? true;
  const { baseAppURL } = useSelector(getConfig);
  const [disableAnalytics] = useLocalStorage("disableAnalytics", false);
  if (isProduction && (!disableAnalytics || disableAnalytics === "false")) {
    initialize("UA-1018242-68");
    pageview(window.location.href.replace(window.location.origin, ""));
  }

  return (
    <Router basename={baseAppURL}>
      <ErrorBoundary>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Routes />
        </QueryParamProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
