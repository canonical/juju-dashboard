/* eslint-disable react-refresh/only-export-components */
import type {
  EnhancedStore,
  Middleware,
  UnknownAction,
} from "@reduxjs/toolkit";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { RenderHookResult } from "@testing-library/react";
import { render, renderHook } from "@testing-library/react";
import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import reactHotToast, { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import type { RouteObject } from "react-router";
import {
  BrowserRouter,
  Outlet,
  Route,
  RouterProvider,
  Routes,
  createMemoryRouter,
} from "react-router";

import { initialiseAuthFromConfig } from "auth";
import generalReducer from "store/general";
import jujuReducer from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";

import { configFactory } from "./factories/general";
import queries from "./queries";

type Router = ReturnType<typeof createMemoryRouter>;

type OptionsWithStore = {
  store: EnhancedStore<RootState>;
};

type OptionsWithState = {
  state?: RootState;
};

type Options = {
  url?: string;
  path?: string;
  routeChildren?: RouteObject[];
  initialProps?: Record<string, unknown>;
} & (OptionsWithState | OptionsWithStore);

export type ComponentProps = {
  path: string;
  routeChildren?: ReactNode;
  store: EnhancedStore<RootState>;
} & PropsWithChildren;

export const ComponentProviders = ({
  children,
  routeChildren,
  path,
  store,
}: ComponentProps) => (
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path={path} element={children}>
          {routeChildren}
        </Route>
        {/* Capture other paths to prevent warnings when navigating in tests. */}
        <Route path="*" element={<span />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);

export const changeURL = (url: string) => window.happyDOM.setURL(url);

export const wrapComponent = (
  component: ReactNode,
  options?: null | Options,
) => {
  const store =
    options && "store" in options
      ? options.store
      : createStore(options?.state ?? rootStateFactory.build());
  const config = store.getState().general.config || configFactory.build();
  initialiseAuthFromConfig(config, store.dispatch);
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <Outlet context={{ setStatus: vi.fn() }} />,
        children: [
          {
            path: options?.path ?? "/",
            element: <Provider store={store}>{component}</Provider>,
            children: options?.routeChildren,
          },
          // Capture other paths to prevent warnings when navigating in tests.
          { path: "*", element: <span>Navigated to an unknown URL.</span> },
        ],
      },
    ],
    { initialEntries: [options?.url ?? "/"] },
  );
  return {
    router,
    Component: () => <RouterProvider router={router} />,
    store,
    Wrapper: ({ children }: PropsWithChildren) => {
      useEffect(
        () => () => {
          // Clean up all toast messages to prevent bleed between tests.
          reactHotToast.remove();
        },
        [],
      );
      return (
        <Provider store={store}>
          <Toaster toastOptions={{ duration: 0 }} />
          {children}
        </Provider>
      );
    },
  };
};

export const renderComponent = (
  component: ReactNode,
  options?: null | Options,
) => {
  const { router, Component, store, Wrapper } = wrapComponent(
    component,
    options,
  );
  const result = render(<Component />, {
    queries,
    wrapper: Wrapper,
  });
  return { router, result, store };
};

export const renderWrappedHook = <Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: null | Options,
): {
  router: null | Router;
  store: null | OptionsWithStore["store"];
} & RenderHookResult<Result, Props> => {
  let router: null | Router = null;
  let store: null | OptionsWithStore["store"] = null;
  const result = renderHook(hook, {
    queries,
    wrapper: ({ children }: PropsWithChildren) => {
      const {
        router: returnedRouter,
        Component,
        store: returnedStore,
        Wrapper,
      } = wrapComponent(children, options);
      router = returnedRouter;
      store = returnedStore;
      return (
        <Wrapper>
          <Component />
        </Wrapper>
      );
    },
  });
  return { ...result, router, store };
};

export function createStore(
  state: RootState,
  options: { trackActions: true },
): [EnhancedStore<RootState>, UnknownAction[]];
export function createStore(
  state: RootState,
  options?: { trackActions: false },
): EnhancedStore<RootState>;
export function createStore(
  state: RootState,
  options: { trackActions: boolean } = { trackActions: false },
) {
  const actions: UnknownAction[] = [];
  const store = configureStore({
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware();
      if (options.trackActions) {
        middleware.push(((_store) => (next) => (action) => {
          actions.push(action as UnknownAction);
          return next(action);
        }) as Middleware<unknown, RootState>);
      }
      return middleware;
    },
    preloadedState: state,
    reducer: combineReducers({
      general: generalReducer,
      juju: jujuReducer,
    }),
  });
  if (options.trackActions) {
    return [store, actions] as const;
  }
  return store;
}
