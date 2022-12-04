import * as actions from "./actions";
import { actionsList } from "./action-types";

describe("action creators", () => {
  it("updateModelList", () => {
    const models = [{ model: "data" }];
    expect(
      actions.updateModelList(models, "wss://test.example.com")
    ).toStrictEqual({
      type: actionsList.updateModelList,
      payload: {
        models,
        wsControllerURL: "wss://test.example.com",
      },
    });
  });
});
