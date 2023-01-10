import { actions, reducer } from "./slice";

const defaultState = {
  appVersion: null,
  config: null,
  controllerConnections: null,
  credentials: null,
  loginError: null,
  pingerIntervalIds: null,
  visitURL: null,
};

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "", payload: true })).toStrictEqual(
      defaultState
    );
  });

  it("updateControllerConnection", () => {
    const state = {
      ...defaultState,
      controllerConnections: {
        "wss://example.com": "default info",
      },
    };
    expect(
      reducer(
        state,
        actions.updateControllerConnection({
          wsControllerURL: "wss://example.com",
          info: "new info",
        })
      )
    ).toStrictEqual({
      ...state,
      controllerConnections: {
        "wss://example.com": "new info",
      },
    });
  });

  it("storeConfig", () => {
    const state = {
      ...defaultState,
      config: {
        controllerAPIEndpoint: "wss://controller.example.com",
        baseAppURL: "/",
        identityProviderAvailable: false,
        identityProviderURL: "",
        isJuju: true,
      },
    };
    const newConfig = {
      controllerAPIEndpoint: "wss://new.example.com",
      baseAppURL: "/",
      identityProviderAvailable: false,
      identityProviderURL: "",
      isJuju: true,
    };
    expect(reducer(state, actions.storeConfig(newConfig))).toStrictEqual({
      ...state,
      config: newConfig,
    });
  });

  it("storeLoginError", () => {
    const state = {
      ...defaultState,
      loginError: "old error",
    };
    expect(reducer(state, actions.storeLoginError("new error"))).toStrictEqual({
      ...state,
      loginError: "new error",
    });
  });

  it("storeUserPass", () => {
    const state = {
      ...defaultState,
      credentials: {
        "wss://example.com": {
          user: "user-eggman@external",
          password: "verysecure123",
        },
      },
    };
    expect(
      reducer(
        state,
        actions.storeUserPass({
          wsControllerURL: "wss://example.com",
          credential: {
            user: "user-eggman2@external",
            password: "verysecure123",
          },
        })
      )
    ).toStrictEqual({
      ...state,
      credentials: {
        "wss://example.com": {
          user: "user-eggman2@external",
          password: "verysecure123",
        },
      },
    });
  });

  it("storeVersion", () => {
    const state = {
      ...defaultState,
      appVersion: "0.1",
    };
    expect(reducer(state, actions.storeVersion("1.2"))).toStrictEqual({
      ...state,
      appVersion: "1.2",
    });
  });

  it("storeVisitURL", () => {
    const state = {
      ...defaultState,
      visitURL: "/visit",
    };
    expect(reducer(state, actions.storeVisitURL("/welcome"))).toStrictEqual({
      ...state,
      visitURL: "/welcome",
    });
  });

  it("logOut", () => {
    const state = {
      ...defaultState,
      controllerConnections: {
        "wss://example.com": "default info",
      },
      visitURL: "/visit",
    };
    expect(reducer(state, actions.logOut())).toStrictEqual({
      ...state,
      controllerConnections: null,
      visitURL: null,
    });
  });

  it("updatePingerIntervalId", () => {
    const state = {
      ...defaultState,
      pingerIntervalIds: {
        "wss://example.com": 5,
      },
    };
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
