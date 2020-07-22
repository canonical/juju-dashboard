import * as actions from "./actions";

describe("action creators", () => {
  it("updateModelList", () => {
    const models = [{ model: "data" }];
    expect(actions.updateModelList(models)).toStrictEqual({
      type: actions.actionsList.updateModelList,
      payload: models,
    });
  });
});
