import { screen, waitFor } from "@testing-library/dom";
import log from "loglevel";
import type { UnknownAction } from "redux";
import { vi } from "vitest";

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

vi.mock("components/App", () => {
  const App = () => <div data-testid="app"></div>;
  return { default: App };
});

vi.mock("store", () => {
  return {
    default: {
      dispatch: vi.fn(),
      getState: vi.fn(),
      subscribe: vi.fn(),
    },
  };
});

vi.mock("loglevel", async () => {
  const actual = await vi.importActual("loglevel");
  return {
    ...actual,
    error: vi.fn(),
  };
});

const appVersion = packageJSON.version;

describe("renderApp", () => {
  let rootNode: HTMLElement;
  const windowLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      value: new URL(window.location.href),
    });
    // Hide the config errors from the test output.
    vi.spyOn(log, "error").mockImplementation(() => vi.fn());
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
    if (rootNode) {
      document.body.removeChild(rootNode);
    }
    window.jujuDashboardConfig = undefined;
    vi.useRealTimers();
  });

  it("polls the config if it is not found", async () => {
    vi.useFakeTimers();
    window.jujuDashboardConfig = undefined;
    renderApp();
    for (let index = 0; index < 5; index++) {
      expect(document.querySelector(`#${ROOT_ID}`)?.children).toHaveLength(0);
      vi.advanceTimersByTime(RECHECK_TIME);
    }
    vi.useRealTimers();
    await waitFor(() => {
      expect(
        screen.getByText(Label.NO_CONFIG, { exact: false }),
      ).toBeInTheDocument();
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
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn());
    const config = configFactory.build({
      baseControllerURL: null,
      isJuju: true,
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
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn());
    const config = configFactory.build({
      baseControllerURL: null,
      isJuju: true,
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
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn());
    const config = configFactory.build({
      controllerAPIEndpoint: "/api",
      isJuju: true,
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
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn());
    const config = configFactory.build({
      controllerAPIEndpoint: "/api",
      isJuju: true,
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
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn());
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
      isJuju: true,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith(generalActions.storeConfig(config));
    expect(dispatch).toHaveBeenCalledWith(
      generalActions.storeVersion(appVersion),
    );
  });

  it("connects when using Candid", async () => {
    // Mock the result of the thunk a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    vi.spyOn(appThunks, "connectAndStartPolling").mockImplementation(
      vi.fn().mockReturnValue({ type: "connectAndStartPolling" }),
    );
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn().mockResolvedValue({ catch: vi.fn() }));
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
      identityProviderURL: "/candid",
      isJuju: true,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith({ type: "connectAndStartPolling" });
  });

  it("connects when using OIDC", async () => {
    // Mock the result of the thunk a normal action so that it can be tested
    // for. This is necessary because we don't have a full store set up which
    // can dispatch thunks (and we don't need to handle the thunk, just know it
    // was dispatched).
    vi.spyOn(appThunks, "connectAndStartPolling").mockImplementation(
      vi.fn().mockReturnValue({ type: "connectAndStartPolling" }),
    );
    const dispatch = vi
      .spyOn(storeModule.default, "dispatch")
      .mockImplementation(vi.fn().mockResolvedValue({ catch: vi.fn() }));
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
      isJuju: false,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(dispatch).toHaveBeenCalledWith({ type: "connectAndStartPolling" });
  });

  it("renders the app", async () => {
    const config = configFactory.build({
      controllerAPIEndpoint: "wss://example.com/api",
      isJuju: true,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId("app")).toBeInTheDocument();
    });
  });
});

describe("getControllerAPIEndpointErrors", () => {
  beforeEach(() => {
    vi.spyOn(log, "error").mockImplementation(() => vi.fn());
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
    vi.spyOn(appThunks, "connectAndStartPolling").mockImplementation(
      vi.fn().mockReturnValue({ type: "connectAndStartPolling" }),
    );
    vi.spyOn(storeModule.default, "dispatch").mockImplementation(
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
      identityProviderURL: "/candid",
      isJuju: true,
    });
    window.jujuDashboardConfig = config;
    renderApp();
    expect(appThunks.connectAndStartPolling).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(log.error).toHaveBeenCalledWith(
        Label.POLLING_ERROR,
        new Error("Error while dispatching connectAndStartPolling!"),
      ),
    );
  });
});
