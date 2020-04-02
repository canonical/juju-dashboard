import dataDump from "testing/complete-redux-store-dump";
import * as actions from "./actions";

describe("action creators", () => {
  it("updateModelList", () => {
    const models = [{ model: "data" }];
    const dispatch = jest.fn();
    const getState = () => dataDump;
    actions.updateModelList(models)(dispatch, getState);
    expect(dispatch.mock.calls).toEqual([
      [
        {
          type: actions.actionsList.updateModelList,
          payload: models,
        },
      ],
    ]);
  });
});
