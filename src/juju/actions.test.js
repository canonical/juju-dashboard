import * as actions from "./actions";

describe("action creators", () => {
  it("updateModelList", () => {
    const models = [{ model: "data" }];
    expect(
      actions.updateModelList(models, "wss://test.example.com")
    ).toStrictEqual({
      type: actions.actionsList.updateModelList,
      payload: {
        models,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });
});
