import { render } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
  routeChildren?: ReactNode;
} & (OptionsWithStore | OptionsWithState);

type ComponentProps = {
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

export const changeURL = (url: string) => window.history.pushState({}, "", url);

export const renderComponent = (
  component: JSX.Element,
  options?: Options | null
) => {
  const store =
    options && "store" in options
      ? options.store
      : configureStore<RootState, unknown>()(
          options?.state ?? rootStateFactory.build()
        );
  changeURL(options?.url ?? "/");
  const result = render(component, {
    wrapper: (props) => (
      <ComponentProviders
        {...props}
        routeChildren={options?.routeChildren}
        path={options?.path ?? "*"}
        store={store}
      />
    ),
  });
  return { changeURL, result, store };
};
