import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";

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
  getActiveUserControllerAccess,
  getConnectionError,
} from "./selectors";

describe("selectors", () => {
  it("getConfig", () => {
    const config = configFactory.build();
    expect(
      getConfig(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config,
          }),
        })
      )
    ).toStrictEqual(config);
  });

  it("getUserPass", () => {
    const credential = credentialFactory.build();
    expect(
      getUserPass(
        rootStateFactory.build({
          general: generalStateFactory.build({
            credentials: {
              "wss://example.com": credential,
            },
          }),
        }),
        "wss://example.com"
      )
    ).toStrictEqual(credential);
  });

  it("getConnectionError", () => {
    expect(
      getConnectionError(
        rootStateFactory.build({
          general: generalStateFactory.build({
            connectionError: "error",
          }),
        })
      )
    ).toBe("error");
  });

  it("getLoginError", () => {
    expect(
      getLoginError(
        rootStateFactory.build({
          general: generalStateFactory.build({
            loginError: "error",
          }),
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
          general: generalStateFactory.build({
            pingerIntervalIds,
          }),
        })
      )
    ).toStrictEqual(pingerIntervalIds);
  });

  it("getAppVersion", () => {
    expect(
      getAppVersion(
        rootStateFactory.build({
          general: generalStateFactory.build({
            appVersion: "5",
          }),
        })
      )
    ).toBe("5");
  });

  it("getControllerConnections", () => {
    const controllerConnections = {
      "wss://example.com": { controllerTag: "controller" },
    };
    expect(
      getControllerConnections(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections,
          }),
        })
      )
    ).toStrictEqual(controllerConnections);
  });

  it("getControllerConnection", () => {
    const controllerConnections = {
      "wss://example.com": { controllerTag: "controller" },
    };
    expect(
      getControllerConnection(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections,
          }),
        }),
        "wss://example.com"
      )
    ).toStrictEqual({ controllerTag: "controller" });
  });

  it("isConnecting", () => {
    expect(
      isConnecting(
        rootStateFactory.build({
          general: generalStateFactory.build({
            visitURL: "/visit",
          }),
        })
      )
    ).toBe(true);
  });

  it("getActiveUserTag", () => {
    expect(
      getActiveUserTag(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com": {
                user: {
                  identity: "user",
                },
              },
            },
          }),
        }),
        "wss://example.com"
      )
    ).toBe("user");
  });

  it("getActiveUserControllerAccess", () => {
    expect(
      getActiveUserControllerAccess(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com": {
                user: {
                  "controller-access": "superuser",
                },
              },
            },
          }),
        }),
        "wss://example.com"
      )
    ).toBe("superuser");
  });

  it("isLoggedIn", () => {
    expect(
      isLoggedIn(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerConnections: {
              "wss://example.com": {
                user: {
                  identity: "user",
                },
              },
            },
          }),
        }),
        "wss://example.com"
      )
    ).toBe(true);
  });

  it("getWSControllerURL", () => {
    expect(
      getWSControllerURL(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config: configFactory.build({
              controllerAPIEndpoint: "wss://controller.example.com",
            }),
          }),
        })
      )
    ).toBe("wss://controller.example.com");
  });
});
