import { actions } from "./slice";

describe("selectors", () => {
  it("userMenuActive", () => {
    expect(actions.userMenuActive(true)).toStrictEqual({
      type: "ui/userMenuActive",
      payload: true,
    });
  });

  it("confirmationPanelActive", () => {
    expect(actions.confirmationModalActive(true)).toStrictEqual({
      type: "ui/confirmationModalActive",
      payload: true,
    });
  });

  it("sideNavCollapsed", () => {
    expect(actions.sideNavCollapsed(true)).toStrictEqual({
      type: "ui/sideNavCollapsed",
      payload: true,
    });
  });
});
