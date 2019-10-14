import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import "./scss/index.scss";

import App from "./components/App/App";
import rootReducer from "./app/root";
import * as serviceWorker from "./serviceWorker";

import {
  fetchAllModelStatuses,
  loginWithBakery,
  LocalMacaroonStore
} from "./juju";
import jujuReducers from "./juju/reducers";
import { fetchModelList } from "./juju/actions";
import {
  storeBakery,
  storeVisitURL,
  updateControllerConnection
} from "./app/actions";

const reduxStore = createStore(
  combineReducers({
    root: rootReducer,
    juju: jujuReducers
  }),
  composeWithDevTools(applyMiddleware(thunk))
);

async function connectAndListModels(reduxStore) {
  try {
    // eslint-disable-next-line no-console
    console.log("Logging into the Juju controller.");
    const { bakery, conn } = await loginWithBakery(resp => {
      reduxStore.dispatch(storeVisitURL(resp.Info.VisitURL));
    }, new LocalMacaroonStore());
    reduxStore.dispatch(storeBakery(bakery));
    reduxStore.dispatch(updateControllerConnection(conn));
    // eslint-disable-next-line no-console
    console.log("Fetching model list.");
    await reduxStore.dispatch(fetchModelList());
    // eslint-disable-next-line no-console
    console.log("Fetching model statuses");

    let continuePolling = true;
    while (continuePolling) {
      await fetchAllModelStatuses(
        conn,
        reduxStore.getState().juju.models,
        reduxStore.dispatch
      );
      // Wait 30s then start again.
      continuePolling = await new Promise(resolve => {
        setTimeout(() => {
          // XXX Add ability to toggle true to false to pause polling.
          resolve(true);
        }, 30000);
      });
      // Fetch the model list again as it may have changed.
      await reduxStore.dispatch(fetchModelList());
    }
  } catch (error) {
    // XXX Surface error to UI.
    // XXX Send to sentry.
    // eslint-disable-next-line no-console
    console.log("Something went wrong: ", error);
  }
}

connectAndListModels(reduxStore);

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
