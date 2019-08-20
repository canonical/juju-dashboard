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

import { loginWithBakery } from "./juju";
import jujuReducers from "./juju/reducers";
import { fetchModelList } from "./juju/actions";
import { actionsList } from "./reducers/actions";

const reduxStore = createStore(
  combineReducers({
    root: rootReducer,
    juju: jujuReducers
  }),
  composeWithDevTools(applyMiddleware(thunk))
);

// eslint-disable-next-line no-shadow
async function connectAndListModels(reduxStore) {
  try {
    const conn = await loginWithBakery();
    reduxStore.dispatch({
      type: actionsList.updateControllerConnection,
      payload: conn
    });
    reduxStore.dispatch(fetchModelList());
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
