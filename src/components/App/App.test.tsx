import { render, screen } from "@testing-library/react";
import * as reactGA from "react-ga";
import { Provider } from "react-redux";
import * as reactRouterDOM from "react-router-dom";
import configureStore from "redux-mock-store";
import { vi } from "vitest";

import * as Routes from "components/Routes";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";

import App from "./App";

vi.mock("components/Routes", () => ({
  default: vi.fn(),
}));

vi.mock("react-ga", () => ({
  initialize: vi.fn(),
  pageview: vi.fn(),
}));

const mockStore = configureStore([]);

describe("App", () => {
  let consoleError: Console["error"];

  beforeEach(() => {
    consoleError = console.error;
    // Even though the error boundary catches the error, there is still a
    // console.error in the test output.
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = consoleError;
    vi.resetAllMocks();
    vi.unstubAllEnvs();
  });

  it("properly sets up Router", () => {
    const BrowserRouterSpy = vi
      .spyOn(reactRouterDOM, "BrowserRouter")
      .mockImplementation(() => <div></div>);
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(BrowserRouterSpy.mock.calls[0][0].basename).toBe("/");
    BrowserRouterSpy.mockRestore();
  });

  it("catches and displays errors", () => {
    vi.spyOn(Routes, "default").mockImplementation(() => {
      throw new Error("This is a thrown error");
    });
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(screen.getByText("This is a thrown error")).toBeInTheDocument();
  });

  it("displays connection errors", () => {
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { connectionError: "Can't connect" } });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(screen.getByText(/Can't connect/)).toBeInTheDocument();
  });

  it("sends pageview events", () => {
    vi.stubEnv("PROD", true);
    window.happyDOM.setURL("/models");
    const initializeSpy = vi.spyOn(reactGA, "initialize");
    const pageviewSpy = vi.spyOn(reactGA, "pageview");
    const state = rootStateFactory.withGeneralConfig().build();
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(initializeSpy).toHaveBeenCalled();
    expect(pageviewSpy).toHaveBeenCalledWith("/models");
  });

  it("does not send pageview events if analytics is disabled", () => {
    vi.stubEnv("PROD", true);
    window.happyDOM.setURL("/models");
    const initializeSpy = vi.spyOn(reactGA, "initialize");
    const pageviewSpy = vi.spyOn(reactGA, "pageview");
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          analyticsEnabled: false,
        }),
      }),
    });
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(initializeSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
  });
});
