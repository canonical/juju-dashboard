import { initialize, pageview } from "react-ga";
import { useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import { Routes } from "components/Routes/Routes";
import useLocalStorage from "hooks/useLocalStorage";
import { getConfig } from "store/general/selectors";

import "../../scss/index.scss";

function App() {
  const isProduction = process.env.NODE_ENV === "production" ?? true;
  const config = useSelector(getConfig);
  const [disableAnalytics] = useLocalStorage("disableAnalytics", "false");
  if (isProduction && (!disableAnalytics || disableAnalytics === "false")) {
    initialize("UA-1018242-68");
    pageview(window.location.href.replace(window.location.origin, ""));
  }

  return (
    <Router basename={config?.baseAppURL}>
      <ErrorBoundary>
        <Routes />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
