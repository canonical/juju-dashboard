import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";

import { actions, reducer } from "./slice";

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "", payload: true })).toStrictEqual(
      generalStateFactory.build()
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
        })
      )
    ).toStrictEqual({
      ...state,
      controllerConnections: {
        "wss://example.com": { controllerTag: "new-info" },
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
      loginError: "old error",
    });
    expect(reducer(state, actions.storeLoginError("new error"))).toStrictEqual({
      ...state,
      loginError: "new error",
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
        })
      )
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
      visitURL: "/visit",
    });
    expect(reducer(state, actions.storeVisitURL("/welcome"))).toStrictEqual({
      ...state,
      visitURL: "/welcome",
    });
  });

  it("logOut", () => {
    const state = generalStateFactory.build({
      controllerConnections: {
        "wss://example.com": { controllerTag: "default-info" },
      },
      visitURL: "/visit",
    });
    expect(reducer(state, actions.logOut())).toStrictEqual({
      ...state,
      controllerConnections: null,
      visitURL: null,
    });
  });

  it("cleanupLoginErrors", () => {
    const state = generalStateFactory.build({
      loginError: "Uh oh!",
    });
    expect(reducer(state, actions.cleanupLoginErrors())).toStrictEqual({
      ...state,
      loginError: null,
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
        })
      )
    ).toStrictEqual({
      ...state,
      pingerIntervalIds: {
        "wss://example.com": 19,
      },
    });
  });
});
