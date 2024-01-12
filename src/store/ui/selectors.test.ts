import { rootStateFactory, uiStateFactory } from "testing/factories";

import { isConfirmationModalActive } from "./selectors";

describe("selectors", () => {
  it("isConfirmationModalActive", () => {
    expect(
      isConfirmationModalActive(
        rootStateFactory.build({
          ui: uiStateFactory.build({ confirmationModalActive: true }),
        }),
      ),
    ).toBe(true);
  });
});
