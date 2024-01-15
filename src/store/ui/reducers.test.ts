import { uiStateFactory } from "testing/factories";

import { actions, reducer } from "./slice";

describe("reducers", () => {
  it("default", () => {
    expect(reducer(undefined, { type: "", payload: true })).toStrictEqual(
      uiStateFactory.build(),
    );
  });

  it("confirmationPanelActive", () => {
    expect(
      reducer(undefined, actions.confirmationModalActive(true)),
    ).toStrictEqual(
      uiStateFactory.build({
        confirmationModalActive: true,
      }),
    );
  });
});
