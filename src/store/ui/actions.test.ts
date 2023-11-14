import { actions } from "./slice";

describe("actions", () => {
  it("confirmationPanelActive", () => {
    expect(actions.confirmationModalActive(true)).toStrictEqual({
      type: "ui/confirmationModalActive",
      payload: true,
    });
  });
});
