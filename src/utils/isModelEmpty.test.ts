import { modelDestructionDataFactory } from "testing/factories/juju/juju";

import { isModelEmpty } from "./isModelEmpty";

describe("isModelEmpty", () => {
  it("should return true when a model is empty", () => {
    expect(isModelEmpty(modelDestructionDataFactory.build())).toEqual(true);
  });

  it("should return false when a model has applications", () => {
    expect(
      isModelEmpty(
        modelDestructionDataFactory.build({ applications: ["app1"] }),
      ),
    ).toEqual(false);
  });

  it("should return false when a model has machines", () => {
    expect(
      isModelEmpty(
        modelDestructionDataFactory.build({ machines: ["machine1"] }),
      ),
    ).toEqual(false);
  });

  it("should return false when a model has cross model relations", () => {
    expect(
      isModelEmpty(
        modelDestructionDataFactory.build({
          crossModelRelations: [
            { name: "relation1", endpoints: [], isConnectedOffer: false },
          ],
        }),
      ),
    ).toEqual(false);
  });
});
