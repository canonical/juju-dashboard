import { configureStore } from "@reduxjs/toolkit";
import { useStore } from "react-redux";

import generalReducer from "store/general";
import checkAuth from "store/middleware/check-auth";
import jujuReducer from "juju/reducer";
import { modelPollerMiddleware } from "store/middleware/model-poller";
import uiReducer from "store/ui";
import { JujuState } from "../types";
import { UIState } from "./ui/types";
import { GeneralState } from "./general/types";

const store = configureStore({
  // Order of the middleware is important
  middleware: (getDefaultMiddleware) => {
    // Construct the middleware in such a way that the types don't get lost as
    // suggested by the Redux Toolkit docs:
    // https://redux-toolkit.js.org/usage/usage-with-typescript#correct-typings-for-the-dispatch-type
    const middleware = getDefaultMiddleware();
    // The checkAuth middleware must be first.
    middleware.unshift(checkAuth);
    middleware.push(modelPollerMiddleware);
    return middleware;
  },
  reducer: {
    general: generalReducer,
    juju: jujuReducer,
    ui: uiReducer,
  },
});

// This can be replaced with the returned store type once each slice has been
// migrated to TypeScript.
export type RootState = {
  general: GeneralState;
  juju: JujuState;
  ui: UIState;
};

export const useAppStore = useStore<RootState>;

export type Store = typeof store;

export default store;
