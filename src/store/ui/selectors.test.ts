import { rootStateFactory, uiStateFactory } from "testing/factories";

import {
  isUserMenuActive,
  isConfirmationModalActive,
  isSideNavCollapsed,
} from "./selectors";

describe("selectors", () => {
  it("isUserMenuActive", () => {
    expect(
      isUserMenuActive(
        rootStateFactory.build({
          ui: uiStateFactory.build({ userMenuActive: true }),
        })
      )
    ).toBe(true);
  });

  it("isConfirmationModalActive", () => {
    expect(
      isConfirmationModalActive(
        rootStateFactory.build({
          ui: uiStateFactory.build({ confirmationModalActive: true }),
        })
      )
    ).toBe(true);
  });

  it("isSideNavCollapsed", () => {
    expect(
      isSideNavCollapsed(
        rootStateFactory.build({
          ui: uiStateFactory.build({ sideNavCollapsed: true }),
        })
      )
    ).toBe(true);
  });
});
