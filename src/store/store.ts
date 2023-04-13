import type { AnyAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector, useStore } from "react-redux";

import generalReducer from "store/general";
import jujuReducer from "store/juju";
import checkAuth from "store/middleware/check-auth";
import { modelPollerMiddleware } from "store/middleware/model-poller";
import uiReducer from "store/ui";

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

export type RootState = ReturnType<typeof store.getState>;

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
