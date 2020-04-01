import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { Bakery, BakeryStorage } from "@canonical/macaroon-bakery";
import App from "components/App/App";
import checkAuth from "app/check-auth";
import rootReducer from "app/root";
import {
  connectAndStartPolling,
  storeBakery,
  storeConfig,
  storeVisitURL,
} from "app/actions";

import { getConfig } from "app/selectors";

import jujuReducers from "juju/reducers";

import "./scss/index.scss";

import * as serviceWorker from "./serviceWorker";

if (!window.jaasDashboardConfig) {
  console.error(
    "Configuration values not defined unable to bootstrap application"
  );
}

const reduxStore = createStore(
  combineReducers({
    root: rootReducer,
    juju: jujuReducers,
  }),
  // Order of the middleware is important
  composeWithDevTools(applyMiddleware(checkAuth, thunk))
);

// If the baseControllerURL is `null` then set it's value to the
// hostname:port of the server serving the application. This is done as the
// hostname:port is not always provided by the Juju webserver but in which
// case we can reliably connect to the API using the same hostname:port as
// the dashboard assets are served from.
const config = window.jaasDashboardConfig;
if (config.baseControllerURL === null) {
  config.baseControllerURL = window.location.host;
}
reduxStore.dispatch(storeConfig(window.jaasDashboardConfig));

const bakery = new Bakery({
  visitPage: resp => {
    reduxStore.dispatch(storeVisitURL(resp.Info.VisitURL));
  },
  storage: new BakeryStorage(localStorage, {}),
});
reduxStore.dispatch(storeBakery(bakery));

if (getConfig(reduxStore.getState()).identityProviderAvailable) {
  // If an identity provider is available then try and connect automatically
  // If not then wait for the login UI to trigger this
  reduxStore.dispatch(connectAndStartPolling(reduxStore, bakery));
}

const rootElement = document.getElementById("root");

ReactDOM.render(
  <Provider store={reduxStore}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
