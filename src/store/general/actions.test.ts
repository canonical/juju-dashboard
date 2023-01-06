import { actions } from "./slice";

describe("selectors", () => {
  it("updateControllerConnection", () => {
    expect(
      actions.updateControllerConnection({
        wsControllerURL: "wss://example.com",
        info: "info",
      })
    ).toStrictEqual({
      type: "general/updateControllerConnection",
      payload: {
        wsControllerURL: "wss://example.com",
        info: "info",
      },
    });
  });

  it("storeConfig", () => {
    expect(actions.storeConfig("config")).toStrictEqual({
      type: "general/storeConfig",
      payload: "config",
    });
  });

  it("storeLoginError", () => {
    expect(actions.storeLoginError("error")).toStrictEqual({
      type: "general/storeLoginError",
      payload: "error",
    });
  });

  it("storeUserPass", () => {
    expect(
      actions.storeUserPass({
        wsControllerURL: "wss://example.com",
        credentials: "credentials",
      })
    ).toStrictEqual({
      type: "general/storeUserPass",
      payload: {
        wsControllerURL: "wss://example.com",
        credentials: "credentials",
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
        intervalId: "1",
      })
    ).toStrictEqual({
      type: "general/updatePingerIntervalId",
      payload: {
        wsControllerURL: "wss://example.com",
        intervalId: "1",
      },
    });
  });
});
