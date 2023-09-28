import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
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
  getIsJuju,
  getControllerFeatures,
  getControllerFeatureEnabled,
  getLoginErrors,
  isCrossModelQueriesEnabled,
  isAuditLogsEnabled,
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

  it("getIsJuju", () => {
    expect(
      getIsJuju(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config: configFactory.build({
              isJuju: true,
            }),
          }),
        })
      )
    ).toStrictEqual(true);
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

  it("getLoginErrors", () => {
    expect(
      getLoginErrors(
        rootStateFactory.build({
          general: generalStateFactory.build({
            loginErrors: { "wss://example.com": "error" },
          }),
        })
      )
    ).toMatchObject({ "wss://example.com": "error" });
  });

  it("getLoginError", () => {
    expect(
      getLoginError(
        rootStateFactory.build({
          general: generalStateFactory.build({
            loginErrors: { "wss://example.com": "error" },
          }),
        }),
        "wss://example.com"
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

  it("getControllerFeatures", () => {
    const controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://controller.example.com": controllerFeaturesFactory.build({
        crossModelQueries: true,
      }),
    });
    expect(
      getControllerFeatures(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerFeatures,
          }),
        })
      )
    ).toStrictEqual(controllerFeatures);
  });

  it("getControllerFeatureEnabled", () => {
    expect(
      getControllerFeatureEnabled(
        rootStateFactory.build({
          general: generalStateFactory.build({
            controllerFeatures: controllerFeaturesStateFactory.build({
              "wss://controller.example.com": controllerFeaturesFactory.build({
                crossModelQueries: true,
              }),
            }),
          }),
        }),
        "wss://controller.example.com",
        "crossModelQueries"
      )
    ).toStrictEqual(true);
  });

  it("isCrossModelQueriesEnabled", () => {
    expect(
      isCrossModelQueriesEnabled(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config: configFactory.build({
              controllerAPIEndpoint: "wss://controller.example.com",
              isJuju: false,
            }),
            controllerFeatures: controllerFeaturesStateFactory.build({
              "wss://controller.example.com": controllerFeaturesFactory.build({
                crossModelQueries: true,
              }),
            }),
          }),
        })
      )
    ).toStrictEqual(true);
  });

  it("isCrossModelQueriesEnabled is not enabled when using Juju controller", () => {
    expect(
      isCrossModelQueriesEnabled(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config: configFactory.build({
              controllerAPIEndpoint: "wss://controller.example.com",
              isJuju: true,
            }),
            controllerFeatures: controllerFeaturesStateFactory.build({
              "wss://controller.example.com": controllerFeaturesFactory.build({
                crossModelQueries: true,
              }),
            }),
          }),
        })
      )
    ).toStrictEqual(false);
  });

  it("isAuditLogsEnabled", () => {
    expect(
      isAuditLogsEnabled(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config: configFactory.build({
              controllerAPIEndpoint: "wss://controller.example.com",
              isJuju: false,
            }),
            controllerFeatures: controllerFeaturesStateFactory.build({
              "wss://controller.example.com": controllerFeaturesFactory.build({
                auditLogs: true,
              }),
            }),
          }),
        })
      )
    ).toStrictEqual(true);
  });

  it("isAuditLogsEnabled is not enabled when using Juju controller", () => {
    expect(
      isAuditLogsEnabled(
        rootStateFactory.build({
          general: generalStateFactory.build({
            config: configFactory.build({
              controllerAPIEndpoint: "wss://controller.example.com",
              isJuju: true,
            }),
            controllerFeatures: controllerFeaturesStateFactory.build({
              "wss://controller.example.com": controllerFeaturesFactory.build({
                auditLogs: true,
              }),
            }),
          }),
        })
      )
    ).toStrictEqual(false);
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
