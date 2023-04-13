import { uiStateFactory } from "testing/factories";

import { actions, reducer } from "./slice";

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "", payload: true })).toStrictEqual(
      uiStateFactory.build()
    );
  });

  it("userMenuActive", () => {
    expect(reducer(undefined, actions.userMenuActive(true))).toStrictEqual(
      uiStateFactory.build({
        userMenuActive: true,
      })
    );
  });

  it("confirmationPanelActive", () => {
    expect(
      reducer(undefined, actions.confirmationModalActive(true))
    ).toStrictEqual(
      uiStateFactory.build({
        confirmationModalActive: true,
      })
    );
  });

  it("sideNavCollapsed", () => {
    expect(reducer(undefined, actions.sideNavCollapsed(true))).toStrictEqual(
      uiStateFactory.build({
        sideNavCollapsed: true,
      })
    );
  });
});
