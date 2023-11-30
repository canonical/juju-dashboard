import { initialize, pageview } from "react-ga";
import { BrowserRouter as Router } from "react-router-dom";

import ConnectionError from "components/ConnectionError";
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import { Routes } from "components/Routes/Routes";
import { getAnalyticsEnabled, getConfig } from "store/general/selectors";
import { useAppSelector } from "store/store";

import "../../scss/index.scss";

function App() {
  const isProduction = process.env.NODE_ENV === "production" ?? true;
  const config = useAppSelector(getConfig);
  const analyticsEnabled = useAppSelector(getAnalyticsEnabled);
  if (isProduction && analyticsEnabled) {
    initialize("UA-1018242-68");
    pageview(window.location.href.replace(window.location.origin, ""));
  }

  return (
    <Router basename={config?.baseAppURL}>
      <ErrorBoundary>
        <ConnectionError>
          <Routes />
        </ConnectionError>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
