import type { ModelSelectionParams } from "store/juju/types";

import { formatBulkDestructionData } from "./formatBulkDestructionData";

describe("formatBulkDestructionData", () => {
  let model: ModelSelectionParams;

  beforeEach(() => {
    model = {
      modelUUID: "uuid-1",
      modelName: "test-model",
      destroyBlockedReason: null,
    };
  });

  it("returns empty arrays when given an empty list", () => {
    expect(formatBulkDestructionData([])).toStrictEqual({
      destroyable: [],
      skipped: [],
      reviewed: [],
    });
  });

  it("puts a plain model into destroyable only", () => {
    expect(formatBulkDestructionData([model])).toStrictEqual({
      destroyable: [model],
      skipped: [],
      reviewed: [],
    });
  });

  it("puts a skipped model into skipped only", () => {
    model = { ...model, skipped: true };
    expect(formatBulkDestructionData([model])).toStrictEqual({
      destroyable: [],
      skipped: [model],
      reviewed: [],
    });
  });

  it("puts a reviewed model into both destroyable and reviewed", () => {
    model = { ...model, reviewed: true };
    expect(formatBulkDestructionData([model])).toStrictEqual({
      destroyable: [model],
      skipped: [],
      reviewed: [model],
    });
  });

  it("does not put a skipped+reviewed model into destroyable or reviewed", () => {
    model = { ...model, skipped: true, reviewed: true };
    expect(formatBulkDestructionData([model])).toStrictEqual({
      destroyable: [],
      skipped: [model],
      reviewed: [],
    });
  });

  it("correctly categorises a mixed list", () => {
    const plain = { ...model, modelUUID: "uuid-plain" };
    const skipped = { ...model, modelUUID: "uuid-skipped", skipped: true };
    const reviewed = { ...model, modelUUID: "uuid-reviewed", reviewed: true };

    expect(formatBulkDestructionData([plain, skipped, reviewed])).toStrictEqual(
      {
        destroyable: [plain, reviewed],
        skipped: [skipped],
        reviewed: [reviewed],
      },
    );
  });
});
