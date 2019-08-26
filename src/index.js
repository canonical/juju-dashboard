import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import "./scss/index.scss";

import App from "./components/App/App";
import rootReducer from "./reducers/root";
import * as serviceWorker from "./serviceWorker";

import { fetchAllModelStatuses, loginWithBakery } from "./juju";
import jujuReducers from "./juju/reducers";
import { actionsList as jujuActionsList, fetchModelList } from "./juju/actions";
import { actionsList } from "./reducers/actions";

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
    const conn = await loginWithBakery();
    reduxStore.dispatch({
      type: actionsList.updateControllerConnection,
      payload: conn
    });
    // eslint-disable-next-line no-console
    console.log("Fetching model list.");
    await reduxStore.dispatch(fetchModelList());
    // This will only loop through once and fetch the status. A windowed poller
    // needs to be setup instead, it will also need to periodically poll
    // listModels to update the model lists.
    const modelList = reduxStore.getState().juju.models.items;
    // eslint-disable-next-line no-console
    console.log("Fetching model statuses");
    // when is this done so we can restart timer?
    let continuePolling = true;
    while (continuePolling) {
      await fetchAllModelStatuses(modelList, reduxStore.dispatch);
      // Wait 30s then start again.
      continuePolling = await new Promise(resolve => {
        setTimeout(() => {
          // XXX Add ability to toggle true to false to pause polling.
          resolve(true);
        }, 30000);
      });
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
