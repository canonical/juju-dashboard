import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";

import "./scss/index.scss";

import App from "./App";
import rootReducer from "./reducers/root";
import * as serviceWorker from "./serviceWorker";

import { loginWithBakery } from "./juju";

loginWithBakery();

const store = createStore(rootReducer);
const rootElement = document.getElementById("root");

ReactDOM.render(
  <Provider store={store}>
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
