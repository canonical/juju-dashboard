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
import { storeBakery, storeVisitURL } from "app/actions";
import connectAndListModels from "app/model-poller";

import jujuReducers from "juju/reducers";

import "./scss/index.scss";

import * as serviceWorker from "./serviceWorker";

const reduxStore = createStore(
  combineReducers({
    root: rootReducer,
    juju: jujuReducers
  }),
  // Order of the middleware is important
  composeWithDevTools(applyMiddleware(checkAuth, thunk))
);

const bakery = new Bakery({
  visitPage: resp => {
    reduxStore.dispatch(storeVisitURL(resp.Info.VisitURL));
  },
  storage: new BakeryStorage(localStorage, {})
});
reduxStore.dispatch(storeBakery(bakery));

connectAndListModels(reduxStore, bakery);

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
