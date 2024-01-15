import { screen, waitFor } from "@testing-library/dom";
import type { UnknownAction } from "redux";

import * as storeModule from "store";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";

import packageJSON from "../package.json";

import { configFactory } from "./testing/factories/general";

import {
  Label,
  RECHECK_TIME,
  ROOT_ID,
  getControllerAPIEndpointErrors,
  renderApp,
} from "./index";

jest.mock("components/App/App", () => {
  const App = () => <div data-testid="app"></div>;
  return App;
});

jest.mock("store", () => {
  return {
    dispatch: jest.fn(),
    getState: jest.fn(),
    subscribe: jest.fn(),
  };
});

const appVersion = packageJSON.version;

describe("renderApp", () => {
  let rootNode: HTMLElement;
  const consoleError = console.error;
  const windowLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      value: new URL(window.location.href),
    });
    // Hide the config errors from the test output.
    console.error = jest.fn();
    rootNode = document.createElement("div");
    rootNode.setAttribute("id", ROOT_ID);
    document.body.appendChild(rootNode);
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      value: windowLocation,
    });
    console.error = consoleError;
    if (rootNode) {
      document.body.removeChild(rootNode);
    }
    window.jujuDashboardConfig = undefined;
    jest.useRealTimers();
  });

  it("polls the config if it is not found", async () => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
    window.jujuDashboardConfig = undefined;
    renderApp();
    for (let index = 0; index < 5; index++) {
      expect(document.querySelector(`#${ROOT_ID}`)?.children).toHaveLength(0);
      jest.advanceTimersByTime(RECHECK_TIME);
    }
    jest.useRealTimers();
    await waitFor(() => {
      expect(screen.getByText(new RegExp(Label.NO_CONFIG))).toBeInTheDocument();
    });
  });

  it("bootstraps if the config is found", async () => {
    window.jujuDashboardConfig = configFactory.build();
    renderApp();
    await waitFor(() => {
      expect(document.querySelector(`#${ROOT_ID}`)?.children).toHaveLength(1);
    });
  });

  it("handles 2.9 unsecure controller endpoints", async () => {
    window.location.href = "http://example.com";
    const dispatch = jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(jest.fn());
    const config = configFactory.build({
      baseControllerURL: null,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConfig({
        ...config,
        controllerAPIEndpoint: "ws://example.com/api",
      }),
    );
  });

  it("handles 2.9 secure controller endpoints", async () => {
    window.location.href = "https://example.com";
    const dispatch = jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(jest.fn());
    const config = configFactory.build({
      baseControllerURL: null,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConfig({
        ...config,
        controllerAPIEndpoint: "wss://example.com/api",
      }),
    );
  });

  it("displays controller endpoint errors", async () => {
    window.jujuDashboardConfig = configFactory.build({
      controllerAPIEndpoint: "",
    });
    renderApp();
    await waitFor(() => {
      expect(
        screen.getByText(/controllerAPIEndpoint is not set/),
      ).toBeInTheDocument();
    });
  });

  it("handles unsecure relative controller endpoints", async () => {
    window.location.href = "http://example.com";
    const dispatch = jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(jest.fn());
    const config = configFactory.build({
      controllerAPIEndpoint: "/api",
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConfig({
        ...config,
        controllerAPIEndpoint: "ws://example.com/api",
      }),
    );
  });

  it("handles secure relative controller endpoints", async () => {
    window.location.href = "https://example.com";
    const dispatch = jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(jest.fn());
    const config = configFactory.build({
      controllerAPIEndpoint: "/api",
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeConfig({
        ...config,
        controllerAPIEndpoint: "wss://example.com/api",
      }),
    );
  });

  it("stores the config and app version", async () => {
    const dispatch = jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(jest.fn());
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith(generalActions.storeConfig(config));
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeVersion(appVersion),
    );
  });

  it("connects if there is an identity provider", async () => {
    // Mock the result of the thunk a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "connectAndStartPolling" }),
      );
    const dispatch = jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(jest.fn().mockResolvedValue({ catch: jest.fn() }));
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
      identityProviderAvailable: true,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith({ type: "connectAndStartPolling" });
  });

  it("renders the app", async () => {
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
    });
    window.jujuDashboardConfig = config;
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId("app")).toBeInTheDocument();
    });
  });
});

describe("getControllerAPIEndpointErrors", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it("should handle secure protocol", () => {
    expect(
      getControllerAPIEndpointErrors("wss://example.com:80/api"),
    ).toBeNull();
  });

  it("should handle non-secure protocol", () => {
    expect(
      getControllerAPIEndpointErrors("ws://example.com:80/api"),
    ).toBeNull();
  });

  it("should handle absolute path only", () => {
    expect(getControllerAPIEndpointErrors("/api")).toBeNull();
  });

  it("should error if it is not set", () => {
    expect(getControllerAPIEndpointErrors()).toBe(
      "controllerAPIEndpoint is not set.",
    );
  });

  it("should error if it does not end with /api", () => {
    expect(getControllerAPIEndpointErrors("wss://example.com:80/notapi")).toBe(
      "controllerAPIEndpoint (wss://example.com:80/notapi) must end with /api.",
    );
  });

  it("should error if it does not contain a hostname or IP", () => {
    expect(getControllerAPIEndpointErrors("wss:///api")).toBe(
      "controllerAPIEndpoint (wss:///api) must be an absolute path or contain a hostname or IP.",
    );
  });

  it("should error if it does not have a websocket protocol", () => {
    expect(getControllerAPIEndpointErrors("http://example.com:80/api")).toBe(
      "controllerAPIEndpoint (http://example.com:80/api) must be an absolute path or begin with ws:// or wss://.",
    );
  });

  it("should error if it does not contain a protocol", () => {
    expect(getControllerAPIEndpointErrors("example.com:80/api")).toBe(
      "controllerAPIEndpoint (example.com:80/api) must be an absolute path or begin with ws:// or wss://.",
    );
  });

  it("should show console error when dispatching connectAndStartPolling", async () => {
    jest
      .spyOn(appThunks, "connectAndStartPolling")
      .mockImplementation(
        jest.fn().mockReturnValue({ type: "connectAndStartPolling" }),
      );
    jest
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(
        (action) =>
          (action instanceof Object &&
          "type" in action &&
          action.type === "connectAndStartPolling"
            ? Promise.reject(
                new Error("Error while dispatching connectAndStartPolling!"),
              )
            : null) as unknown as UnknownAction,
      );
    const config = configFactory.build({
      baseControllerURL: null,
      identityProviderAvailable: true,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(appThunks.connectAndStartPolling).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        Label.POLLING_ERROR,
        new Error("Error while dispatching connectAndStartPolling!"),
      ),
    );
  });
});
