import { generateChips } from "./utils";

describe("generateChips", () => {
  it("generates a chip for each value", () => {
    expect(generateChips("Cloud", ["aws", "gce"])).toStrictEqual([
      { lead: "Cloud", value: "aws" },
      { lead: "Cloud", value: "gce" },
    ]);
  });

  it("only generates a chip once for duplicate values", () => {
    expect(generateChips("Cloud", ["aws", "gce", "aws", "aws"])).toStrictEqual([
      { lead: "Cloud", value: "aws" },
      { lead: "Cloud", value: "gce" },
    ]);
  });

  it("does not generate chips if there are no values", () => {
    expect(generateChips("Cloud", [])).toStrictEqual([]);
  });
});
