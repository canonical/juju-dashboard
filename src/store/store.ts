import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import checkAuth from "app/check-auth";
import generalReducer from "app/general";
import jujuReducer from "juju/reducer";
import { modelPollerMiddleware } from "store/middleware/model-poller";
import uiReducer from "ui";

const reduxStore = createStore(
  combineReducers({
    general: generalReducer,
    juju: jujuReducer,
    ui: uiReducer,
  }),
  // Order of the middleware is important
  composeWithDevTools(applyMiddleware(checkAuth, thunk, modelPollerMiddleware))
);

export default reduxStore;
