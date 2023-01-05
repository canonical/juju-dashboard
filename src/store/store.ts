import { AnyAction, configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from "react-redux";

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

export type Store = typeof store;
export type AppDispatch = typeof store.dispatch;
export const useAppStore = useStore<RootState>;
// This hook can be used in place of useDispatch to get correctly typed dispatches using thunks or
// action objects as suggested by the docs:
// https://redux-toolkit.js.org/usage/usage-with-typescript#correct-typings-for-the-dispatch-type
export const useAppDispatch: () => AppDispatch = useDispatch;
// This hook can be used in place of useDispatch to get correctly typed dispatches that return promises.
export const usePromiseDispatch = () => {
  const dispatch = useAppDispatch();
  return <Result>(action: AnyAction) =>
    (dispatch as (action: AnyAction) => Promise<Result>)(action);
};
// This hook annotates the selectors using the store state.
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
