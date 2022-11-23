import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import process from "process";
import { Bakery, BakeryStorage } from "@canonical/macaroon-bakery";
import * as Sentry from "@sentry/browser";
import App from "components/App/App";
import checkAuth from "app/check-auth";
import rootReducer from "app/root";
import uiReducer from "ui";

import {
  connectAndStartPolling,
  storeBakery,
  storeConfig,
  storeVersion,
  storeVisitURL,
} from "app/actions";

import jujuReducer from "juju/reducer";
import { modelPollerMiddleware } from "store/middleware/model-poller";

import packageJSON from "../package.json";

import * as serviceWorker from "./serviceWorker";

const appVersion = packageJSON.version;

// Webpack 5 no longer makes node variables available at runtime so we need to
// attach `process` to the window:
// https://github.com/facebook/create-react-app/issues/12212
if (!window.process) {
  window.process = process;
}

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://5f679e274f34464194e9592a91ed65d4@sentry.is.canonical.com//29",
  });
  Sentry.setTag("dashboardVersion", appVersion);
}

// Sometimes the config.js file hasn't been parsed by the time this code is
// executed. This is a simple debounce so that in the event it's not it'll wait
// a few cycles before trying again.
let checkCounter = 0;
const checkConfigExists = () => {
  if (!window.jujuDashboardConfig) {
    if (checkCounter < 5) {
      checkCounter++;
      setTimeout(checkConfigExists, 500);
      return;
    } else {
      console.error(
        "Configuration values not defined unable to bootstrap application"
      );
    }
  } else {
    bootstrap();
  }
};
checkConfigExists();

function bootstrap() {
  const config = window.jujuDashboardConfig;
  // It's possible that the charm is generating a relative path for the
  // websocket because it is providing the API on the same host as the
  // application assets.
  // If we were provided with a relative path for the endpoint then we need
  // to build the full correct path for the websocket to connect to.
  const controllerAPIEndpoint = config.controllerAPIEndpoint;
  if (controllerAPIEndpoint) {
    if (!controllerAPIEndpoint.includes("://")) {
      const protocol = window.location.protocol.includes("https")
        ? "wss"
        : "ws";
      config.controllerAPIEndpoint = `${protocol}://${window.location.host}${controllerAPIEndpoint}`;
    }
  }
  // Support Juju 2.9 deployments with the old configuration values.
  // XXX This can be removed once we drop support for 2.9 with the 3.0 release.
  if (config.baseControllerURL === null) {
    const protocol = window.location.protocol.includes("https") ? "wss" : "ws";
    config.controllerAPIEndpoint = `${protocol}://${window.location.host}/api`;
  }

  if (process.env.NODE_ENV === "production") {
    Sentry.setTag("isJuju", config.isJuju);
  }

  const reduxStore = createStore(
    combineReducers({
      root: rootReducer,
      juju: jujuReducer,
      ui: uiReducer,
    }),
    // Order of the middleware is important
    composeWithDevTools(
      applyMiddleware(checkAuth, thunk, modelPollerMiddleware)
    )
  );

  reduxStore.dispatch(storeConfig(config));
  reduxStore.dispatch(storeVersion(appVersion));

  const bakery = new Bakery({
    visitPage: (resp) => {
      reduxStore.dispatch(storeVisitURL(resp.Info.VisitURL));
    },
    storage: new BakeryStorage(localStorage, {}),
  });
  reduxStore.dispatch(storeBakery(bakery));
  if (config.identityProviderAvailable) {
    // If an identity provider is available then try and connect automatically
    // If not then wait for the login UI to trigger this
    reduxStore.dispatch(connectAndStartPolling(reduxStore, bakery));
  }

  const rootElement = document.getElementById("root");

  ReactDOM.render(
    <Provider store={reduxStore}>
      <StrictMode>
        <App />
      </StrictMode>
    </Provider>,
    rootElement
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
