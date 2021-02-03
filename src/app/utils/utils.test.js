import { pluralize } from "./utils";

describe("Util", () => {
  it("pluralize should correctly pluralize a single item", () => {
    const singleItems = 1;
    const label = pluralize(singleItems, "item");
    expect(label).toBe("item");
  });
  it("pluralize should correctly pluralize a multiple item", () => {
    const multipleItems = 2;
    const label = pluralize(multipleItems, "item");
    expect(label).toBe("items");
  });
  it("pluralize special cases correctly", () => {
    const multipleItems = 2;
    const label = pluralize(multipleItems, "allocating");
    expect(label).toBe("allocating");
  });
});
