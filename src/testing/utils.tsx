import type { Router as RemixRouter } from "@remix-run/router";
import { render, renderHook } from "@testing-library/react";
import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import reactHotToast, { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import type { RouteObject } from "react-router-dom";
import {
  BrowserRouter,
  Route,
  RouterProvider,
  Routes,
  createMemoryRouter,
} from "react-router-dom";
import type { MockStoreEnhanced } from "redux-mock-store";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";

type OptionsWithStore = {
  store: MockStoreEnhanced<RootState, unknown>;
};

type OptionsWithState = {
  state?: RootState;
};

type Options = {
  url?: string;
  path?: string;
  routeChildren?: RouteObject[];
} & (OptionsWithStore | OptionsWithState);

export type ComponentProps = {
  path: string;
  routeChildren?: ReactNode;
  store: MockStoreEnhanced<RootState, unknown>;
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
  options?: Options | null,
) => {
  const store =
    options && "store" in options
      ? options.store
      : configureStore<RootState, unknown>()(
          options?.state ?? rootStateFactory.build(),
        );
  const router = createMemoryRouter(
    [
      {
        path: options?.path ?? "*",
        element: <Provider store={store}>{component}</Provider>,
        children: options?.routeChildren,
      },
      // Capture other paths to prevent warnings when navigating in tests.
      { path: "*", element: <span>Navigated to an unknown URL.</span> },
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
  options?: Options | null,
) => {
  const { router, Component, store, Wrapper } = wrapComponent(
    component,
    options,
  );
  const result = render(<Component />, {
    wrapper: Wrapper,
  });
  return { router, result, store };
};

export const renderWrappedHook = <Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: Options | null,
): {
  router: RemixRouter | null;
  result: { current: Result };
  store: OptionsWithStore["store"] | null;
} => {
  let router: RemixRouter | null = null;
  let store: OptionsWithStore["store"] | null = null;
  const { result } = renderHook(hook, {
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
  return { router, result, store };
};
