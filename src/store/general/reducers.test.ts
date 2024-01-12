import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";

import { actions, reducer } from "./slice";

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "", payload: true })).toStrictEqual(
      generalStateFactory.build(),
    );
  });

  it("updateControllerConnection", () => {
    const state = generalStateFactory.build({
      controllerConnections: {
        "wss://example.com": { controllerTag: "default-info" },
      },
    });
    expect(
      reducer(
        state,
        actions.updateControllerConnection({
          wsControllerURL: "wss://example.com",
          info: { controllerTag: "new-info" },
        }),
      ),
    ).toStrictEqual({
      ...state,
      controllerConnections: {
        "wss://example.com": { controllerTag: "new-info" },
      },
    });
  });

  it("updateControllerFeatures", () => {
    const state = generalStateFactory.build({
      controllerFeatures: {},
    });
    expect(
      reducer(
        state,
        actions.updateControllerFeatures({
          wsControllerURL: "wss://example.com",
          features: {
            crossModelQueries: true,
          },
        }),
      ),
    ).toStrictEqual({
      ...state,
      controllerFeatures: {
        "wss://example.com": {
          crossModelQueries: true,
        },
      },
    });
  });

  it("storeConfig", () => {
    const state = generalStateFactory.build();
    const newConfig = configFactory.build({
      controllerAPIEndpoint: "wss://new.example.com",
    });
    expect(reducer(state, actions.storeConfig(newConfig))).toStrictEqual({
      ...state,
      config: newConfig,
    });
  });

  it("storeLoginError", () => {
    const state = generalStateFactory.build({
      loginErrors: { "wss://example.com": "old error" },
    });
    expect(
      reducer(
        state,
        actions.storeLoginError({
          wsControllerURL: "wss://example.com",
          error: "new error",
        }),
      ),
    ).toStrictEqual({
      ...state,
      loginErrors: { "wss://example.com": "new error" },
    });
  });

  it("storeLoginError creates login errors object if it is null", () => {
    const state = generalStateFactory.build({
      loginErrors: null,
    });
    expect(
      reducer(
        state,
        actions.storeLoginError({
          wsControllerURL: "wss://example.com",
          error: "new error",
        }),
      ),
    ).toStrictEqual({
      ...state,
      loginErrors: { "wss://example.com": "new error" },
    });
  });

  it("storeConnectionError", () => {
    const state = generalStateFactory.build({
      connectionError: "old error",
    });
    expect(
      reducer(state, actions.storeConnectionError("new error")),
    ).toStrictEqual({
      ...state,
      connectionError: "new error",
    });
  });

  it("storeUserPass", () => {
    const state = generalStateFactory.build();
    const credential = credentialFactory.build({
      user: "user-eggman2@external",
    });
    expect(
      reducer(
        state,
        actions.storeUserPass({
          wsControllerURL: "wss://example.com",
          credential,
        }),
      ),
    ).toStrictEqual({
      ...state,
      credentials: {
        "wss://example.com": credential,
      },
    });
  });

  it("storeVersion", () => {
    const state = generalStateFactory.build({
      appVersion: "0.1",
    });
    expect(reducer(state, actions.storeVersion("1.2"))).toStrictEqual({
      ...state,
      appVersion: "1.2",
    });
  });

  it("storeVisitURL", () => {
    const state = generalStateFactory.build({
      visitURLs: ["/visit"],
    });
    expect(reducer(state, actions.storeVisitURL("/welcome"))).toStrictEqual({
      ...state,
      visitURLs: ["/visit", "/welcome"],
    });
  });

  it("storeVisitURL creates array if it is null", () => {
    const state = generalStateFactory.build({
      visitURLs: null,
    });
    expect(reducer(state, actions.storeVisitURL("/welcome"))).toStrictEqual({
      ...state,
      visitURLs: ["/welcome"],
    });
  });

  it("removeVisitURL", () => {
    const state = generalStateFactory.build({
      visitURLs: ["/visit", "/welcome"],
    });
    expect(reducer(state, actions.removeVisitURL("/welcome"))).toStrictEqual({
      ...state,
      visitURLs: ["/visit"],
    });
  });

  it("clearVisitURLs", () => {
    const state = generalStateFactory.build({
      visitURLs: ["/visit", "/welcome"],
    });
    expect(reducer(state, actions.clearVisitURLs())).toStrictEqual({
      ...state,
      visitURLs: null,
    });
  });

  it("logOut", () => {
    const state = generalStateFactory.build({
      controllerConnections: {
        "wss://example.com": { controllerTag: "default-info" },
      },
      visitURLs: ["/visit"],
    });
    expect(reducer(state, actions.logOut())).toStrictEqual({
      ...state,
      controllerConnections: null,
      visitURLs: null,
    });
  });

  it("cleanupLoginErrors", () => {
    const state = generalStateFactory.build({
      loginErrors: { "wss://example.com": "Uh oh!" },
    });
    expect(reducer(state, actions.cleanupLoginErrors())).toStrictEqual({
      ...state,
      loginErrors: null,
    });
  });

  it("updatePingerIntervalId", () => {
    const state = generalStateFactory.build({
      pingerIntervalIds: {
        "wss://example.com": 5,
      },
    });
    expect(
      reducer(
        state,
        actions.updatePingerIntervalId({
          wsControllerURL: "wss://example.com",
          intervalId: 19,
        }),
      ),
    ).toStrictEqual({
      ...state,
      pingerIntervalIds: {
        "wss://example.com": 19,
      },
    });
  });
});
