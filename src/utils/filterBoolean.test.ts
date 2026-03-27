import filterBoolean from "./filterBoolean";

describe("filterBoolean", () => {
  it("removes nullish values", () => {
    expect(filterBoolean([undefined, 1, null, "two"])).toStrictEqual([
      1,
      "two",
    ]);
  });
});
