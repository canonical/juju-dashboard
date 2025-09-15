import type { UnknownAction } from "@reduxjs/toolkit";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useCallback } from "react";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector, useStore } from "react-redux";

import generalReducer from "store/general";
import jujuReducer from "store/juju";
import checkAuth from "store/middleware/check-auth";
import { modelPollerMiddleware } from "store/middleware/model-poller";
import { logger } from "utils/logger";

import { listenerMiddleware } from "./listenerMiddleware";

type PreloadedState = Record<string, unknown>;

// Assigning undefined as that is the type required by configureStore.
let preloadedState: PreloadedState | undefined = undefined;
if (
  !import.meta.env.PROD &&
  typeof import.meta.env.VITE_APP_MOCK_STORE === "string"
) {
  try {
    preloadedState = JSON.parse(
      import.meta.env.VITE_APP_MOCK_STORE,
    ) as PreloadedState;
  } catch (error) {
    logger.error("VITE_APP_MOCK_STORE could not be parsed");
  }
}

const store = configureStore({
  // Order of the middleware is important
  middleware: (getDefaultMiddleware) => {
    // Construct the middleware in such a way that the types don't get lost as
    // suggested by the Redux Toolkit docs:
    // https://redux-toolkit.js.org/usage/usage-with-typescript#correct-typings-for-the-dispatch-type
    const middleware = getDefaultMiddleware();
    // The checkAuth middleware must be first.
    middleware.unshift(checkAuth);
    middleware.push(listenerMiddleware.middleware);
    middleware.push(modelPollerMiddleware);
    return middleware;
  },
  preloadedState,
  reducer: combineReducers({
    general: generalReducer,
    juju: jujuReducer,
  }),
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
export const usePromiseDispatch = (): (<Result>(
  action: UnknownAction,
) => Promise<Result>) => {
  const dispatch = useAppDispatch();
  return useCallback(
    <Result>(action: UnknownAction) =>
      (dispatch as (action: UnknownAction) => Promise<Result>)(action),
    [dispatch],
  );
};
// This hook annotates the selectors using the store state.
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
