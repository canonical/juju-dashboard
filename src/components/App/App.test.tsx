import { render, screen } from "@testing-library/react";
import * as reactGA from "react-ga";
import { Provider } from "react-redux";
import * as reactRouterDOM from "react-router-dom";
import configureStore from "redux-mock-store";

import * as Routes from "components/Routes/Routes";
import { DISABLE_ANALYTICS_KEY } from "pages/Settings/Settings";
import { rootStateFactory } from "testing/factories/root";

import App from "./App";

jest.mock("components/Routes/Routes", () => ({
  Routes: jest.fn(),
}));

jest.mock("react-ga", () => ({
  initialize: jest.fn(),
  pageview: jest.fn(),
}));

const mockStore = configureStore([]);

describe("App", () => {
  let consoleError: Console["error"];

  beforeEach(() => {
    consoleError = console.error;
    // Even though the error boundary catches the error, there is still a
    // console.error in the test output.
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
    jest.resetAllMocks();
  });

  it("properly sets up Router", () => {
    const BrowserRouterSpy = jest
      .spyOn(reactRouterDOM, "BrowserRouter")
      .mockImplementation(() => <div></div>);
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(BrowserRouterSpy.mock.calls[0][0].basename).toBe("/");
    BrowserRouterSpy.mockRestore();
  });

  it("catches and displays errors", () => {
    jest.spyOn(Routes, "Routes").mockImplementation(() => {
      throw new Error("This is a thrown error");
    });
    const store = mockStore(rootStateFactory.withGeneralConfig().build());
    render(
      <Provider store={store}>
        <App />
      </Provider>
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
      </Provider>
    );
    expect(screen.getByText(/Can't connect/)).toBeInTheDocument();
  });

  it("sends pageview events", () => {
    window.history.pushState({}, "", "/models");
    const node_env = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "production" });
    const initializeSpy = jest.spyOn(reactGA, "initialize");
    const pageviewSpy = jest.spyOn(reactGA, "pageview");
    const state = rootStateFactory.withGeneralConfig();
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(initializeSpy).toHaveBeenCalled();
    expect(pageviewSpy).toHaveBeenCalledWith("/models");
    Object.defineProperty(process.env, "NODE_ENV", {
      value: node_env,
    });
  });

  it("does not send pageview events if analytics is disabled", () => {
    window.history.pushState({}, "", "/models");
    localStorage.setItem(DISABLE_ANALYTICS_KEY, JSON.stringify(true));
    const node_env = process.env.NODE_ENV;
    Object.defineProperty(process.env, "NODE_ENV", { value: "production" });
    const initializeSpy = jest.spyOn(reactGA, "initialize");
    const pageviewSpy = jest.spyOn(reactGA, "pageview");
    const state = rootStateFactory.withGeneralConfig();
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(initializeSpy).not.toHaveBeenCalled();
    expect(pageviewSpy).not.toHaveBeenCalled();
    Object.defineProperty(process.env, "NODE_ENV", {
      value: node_env,
    });
  });
});
