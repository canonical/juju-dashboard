import { configFactory, credentialFactory } from "testing/factories/general";
import { connectionInfoFactory } from "testing/factories/juju/jujulib";

import { actions } from "./slice";

describe("actions", () => {
  it("cleanupLoginErrors", () => {
    expect(actions.cleanupLoginErrors()).toStrictEqual({
      type: "general/cleanupLoginErrors",
      payload: undefined,
    });
  });

  it("updateControllerConnection", () => {
    const info = connectionInfoFactory.build();
    expect(
      actions.updateControllerConnection({
        wsControllerURL: "wss://example.com",
        info,
      }),
    ).toStrictEqual({
      type: "general/updateControllerConnection",
      payload: {
        wsControllerURL: "wss://example.com",
        info,
      },
    });
  });

  it("updateControllerFeatures", () => {
    expect(
      actions.updateControllerFeatures({
        wsControllerURL: "wss://example.com",
        features: {
          crossModelQueries: true,
        },
      }),
    ).toStrictEqual({
      type: "general/updateControllerFeatures",
      payload: {
        wsControllerURL: "wss://example.com",
        features: {
          crossModelQueries: true,
        },
      },
    });
  });

  it("storeConfig", () => {
    expect(actions.storeConfig(configFactory.build())).toStrictEqual({
      type: "general/storeConfig",
      payload: "config",
    });
  });

  it("storeLoginError", () => {
    expect(
      actions.storeLoginError({
        wsControllerURL: "wss://example.com",
        error: "error",
      }),
    ).toStrictEqual({
      type: "general/storeLoginError",
      payload: {
        wsControllerURL: "wss://example.com",
        error: "error",
      },
    });
  });

  it("storeConnectionError", () => {
    expect(actions.storeConnectionError("error")).toStrictEqual({
      type: "general/storeConnectionError",
      payload: "error",
    });
  });

  it("storeUserPass", () => {
    expect(
      actions.storeUserPass({
        wsControllerURL: "wss://example.com",
        credential: credentialFactory.build(),
      }),
    ).toStrictEqual({
      type: "general/storeUserPass",
      payload: {
        wsControllerURL: "wss://example.com",
        credential: credentialFactory.build(),
      },
    });
  });

  it("storeVersion", () => {
    expect(actions.storeVersion("1.2")).toStrictEqual({
      type: "general/storeVersion",
      payload: "1.2",
    });
  });

  it("storeVisitURL", () => {
    expect(actions.storeVisitURL("/visit")).toStrictEqual({
      type: "general/storeVisitURL",
      payload: "/visit",
    });
  });

  it("updatePingerIntervalId", () => {
    expect(
      actions.updatePingerIntervalId({
        wsControllerURL: "wss://example.com",
        intervalId: 1,
      }),
    ).toStrictEqual({
      type: "general/updatePingerIntervalId",
      payload: {
        wsControllerURL: "wss://example.com",
        intervalId: 1,
      },
    });
  });
});
