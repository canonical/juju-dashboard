import type {
  ListenerMiddlewareInstance,
  UnknownAction,
  EnhancedStore,
  StoreEnhancer,
  Tuple,
} from "@reduxjs/toolkit";
import {
  createListenerMiddleware,
  configureStore,
  createSlice,
} from "@reduxjs/toolkit";
import { waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import type { RootState, AppDispatch } from "store/store";
import { rootStateFactory } from "testing/factories";

import { endpoints } from "./api";
import {
  addWhoamiListener,
  pollWhoamiStart,
  Label,
  pollWhoamiStop,
} from "./listeners";

vi.mock("consts", () => {
  return { OIDC_POLL_INTERVAL: 1 };
});

vi.mock("store/general", async () => {
  const actual = await vi.importActual("store/general");
  return {
    ...actual,
    actions: {
      storeLoginError: vi.fn(),
    },
  };
});

vi.mock("store/app/thunks", async () => {
  const actual = await vi.importActual("store/app/thunks");
  return {
    ...actual,
    logOut: vi.fn(),
  };
});

describe("listeners", () => {
  let listenerMiddleware: ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    unknown
  >;
  let store: EnhancedStore<
    RootState,
    UnknownAction,
    Tuple<
      [
        StoreEnhancer<{
          dispatch: AppDispatch;
        }>,
        StoreEnhancer,
      ]
    >
  >;

  beforeEach(() => {
    fetchMock.resetMocks();
    listenerMiddleware = createListenerMiddleware<RootState, AppDispatch>();
    const slice = createSlice({
      name: "root",
      initialState: rootStateFactory.withGeneralConfig().build(),
      reducers: {},
    });
    store = configureStore({
      reducer: slice.reducer,
      middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware();
        middleware.push(listenerMiddleware.middleware);
        return middleware;
      },
    });
    addWhoamiListener(listenerMiddleware.startListening);
  });

  afterEach(() => {
    listenerMiddleware.clearListeners();
  });

  it("starts polling when start action is dispatched", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });
    expect(global.fetch).not.toHaveBeenCalled();
    store.dispatch(pollWhoamiStart());
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(endpoints.whoami, {
        credentials: "include",
      }),
    );
  });

  it("handles user logged out", async () => {
    vi.spyOn(store, "dispatch");
    vi.spyOn(generalActions, "storeLoginError").mockReturnValue({
      type: "general/storeLoginError",
      payload: { wsControllerURL: "", error: "" },
    });
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 401 });
    store.dispatch(pollWhoamiStart());
    await waitFor(() =>
      expect(generalActions.storeLoginError).toHaveBeenCalledWith({
        error: Label.ERROR_LOGGED_OUT,
        wsControllerURL: "wss://controller.example.com",
      }),
    );
    await waitFor(() => expect(appThunks.logOut).toHaveBeenCalled());
  });

  it("handles errors", async () => {
    vi.spyOn(store, "dispatch");
    vi.spyOn(generalActions, "storeLoginError").mockReturnValue({
      type: "general/storeLoginError",
      payload: { wsControllerURL: "", error: "" },
    });
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });
    store.dispatch(pollWhoamiStart());
    await waitFor(() =>
      expect(generalActions.storeLoginError).toHaveBeenCalledWith({
        error: Label.ERROR_AUTHENTICATION,
        wsControllerURL: "wss://controller.example.com",
      }),
    );
    await waitFor(() => expect(appThunks.logOut).toHaveBeenCalled());
  });

  it("does not display an error when stopping the listener", async () => {
    vi.spyOn(store, "dispatch");
    vi.spyOn(generalActions, "storeLoginError").mockReturnValue({
      type: "general/storeLoginError",
      payload: { wsControllerURL: "", error: "" },
    });
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });
    store.dispatch(pollWhoamiStart());
    store.dispatch(pollWhoamiStop());
    await waitFor(() =>
      expect(generalActions.storeLoginError).not.toHaveBeenCalled(),
    );
  });
});
