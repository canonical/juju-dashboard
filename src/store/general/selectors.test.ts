import { rootStateFactory } from "testing/factories";

import {
  getActiveUserTag,
  getAppVersion,
  getConfig,
  getControllerConnection,
  getControllerConnections,
  getLoginError,
  getPingerIntervalIds,
  getUserPass,
  getWSControllerURL,
  isConnecting,
  isLoggedIn,
} from "./selectors";

const defaultState = {
  appVersion: null,
  config: null,
  controllerConnections: null,
  credentials: null,
  loginError: null,
  pingerIntervalIds: null,
  visitURL: null,
};

describe("selectors", () => {
  it("getConfig", () => {
    const config = {
      controllerAPIEndpoint: "wss://controller.example.com",
      baseAppURL: "/",
      identityProviderAvailable: false,
      identityProviderURL: "",
      isJuju: true,
    };
    expect(
      getConfig(
        rootStateFactory.build({
          general: {
            ...defaultState,
            config,
          },
        })
      )
    ).toStrictEqual(config);
  });

  it("getUserPass", () => {
    expect(
      getUserPass(
        rootStateFactory.build({
          general: {
            ...defaultState,
            credentials: {
              "wss://example.com": "credentials",
            },
          },
        }),
        "wss://example.com"
      )
    ).toBe("credentials");
  });

  it("getLoginError", () => {
    expect(
      getLoginError(
        rootStateFactory.build({
          general: {
            ...defaultState,
            loginError: "error",
          },
        })
      )
    ).toBe("error");
  });

  it("getPingerIntervalIds", () => {
    const pingerIntervalIds = {
      "wss://example.com": 12,
    };
    expect(
      getPingerIntervalIds(
        rootStateFactory.build({
          general: {
            ...defaultState,
            pingerIntervalIds,
          },
        })
      )
    ).toStrictEqual(pingerIntervalIds);
  });

  it("getAppVersion", () => {
    expect(
      getAppVersion(
        rootStateFactory.build({
          general: {
            ...defaultState,
            appVersion: "5",
          },
        })
      )
    ).toBe("5");
  });

  it("getControllerConnections", () => {
    const controllerConnections = {
      "wss://example.com": "connection",
    };
    expect(
      getControllerConnections(
        rootStateFactory.build({
          general: {
            ...defaultState,
            controllerConnections,
          },
        })
      )
    ).toStrictEqual(controllerConnections);
  });

  it("getControllerConnection", () => {
    const controllerConnections = {
      "wss://example.com": "connection",
    };
    expect(
      getControllerConnection(
        rootStateFactory.build({
          general: {
            ...defaultState,
            controllerConnections,
          },
        }),
        "wss://example.com"
      )
    ).toBe("connection");
  });

  it("isConnecting", () => {
    expect(
      isConnecting(
        rootStateFactory.build({
          general: {
            ...defaultState,
            visitURL: "/visit",
          },
        })
      )
    ).toBe(true);
  });

  it("getActiveUserTag", () => {
    expect(
      getActiveUserTag(
        rootStateFactory.build({
          general: {
            ...defaultState,
            controllerConnections: {
              "wss://example.com": {
                user: {
                  identity: "user",
                },
              },
            },
          },
        }),
        "wss://example.com"
      )
    ).toBe("user");
  });

  it("isLoggedIn", () => {
    expect(
      isLoggedIn(
        rootStateFactory.build({
          general: {
            ...defaultState,
            controllerConnections: {
              "wss://example.com": {
                user: {
                  identity: "user",
                },
              },
            },
          },
        }),
        "wss://example.com"
      )
    ).toBe(true);
  });

  it("getWSControllerURL", () => {
    expect(
      getWSControllerURL(
        rootStateFactory.build({
          general: {
            ...defaultState,
            config: {
              controllerAPIEndpoint: "wss://controller.example.com",
              baseAppURL: "/",
              identityProviderAvailable: false,
              identityProviderURL: "",
              isJuju: true,
            },
          },
        })
      )
    ).toBe("wss://controller.example.com");
  });
});
