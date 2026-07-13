import { calculateSpanSize, compareRow } from "./util";

describe("compareRow", () => {
  describe.for([
    ["strings", "first", "second"],
    ["numbers", 43, 123],
    ["booleans", false, true],
  ])("compares %s", ([_, first, second]) => {
    it.for([
      [first, second, 1],
      [second, first, -1],
    ] as const)("both orders", ([valueA, valueB, expected], { expect }) => {
      const result = compareRow(
        "value",
        [{ column: "value", value: valueA }],
        [{ column: "value", value: valueB }],
      );
      expect(result).toBe(expected);
    });
  });

  it.for([
    ["string", "value"],
    ["number", 43],
    ["boolean", true],
  ] as const)("equal %s values", ([_, value], { expect }) => {
    const result = compareRow(
      "value",
      [{ column: "value", value }],
      [{ column: "value", value }],
    );
    expect(result).toEqual(0);
  });

  it.for([
    ["value", 1],
    ["other", -1],
  ] as const)("ignores other cells", ([cell, expected], { expect }) => {
    const result = compareRow(
      cell,
      [
        { column: "value", value: 43 },
        { column: "other", value: 123 },
      ],
      [
        { column: "value", value: 123 },
        { column: "other", value: 43 },
      ],
    );
    expect(result).toBe(expected);
  });

  describe("objects", () => {
    it("handles equal objects", ({ expect }) => {
      const result = compareRow(
        "value",
        [{ column: "value", value: { a: 123, b: true } }],
        [{ column: "value", value: { a: 123, b: true } }],
      );
      expect(result).toEqual(0);
    });

    it("defaults to -1 for unequal objects", ({ expect }) => {
      const result = compareRow(
        "value",
        [{ column: "value", value: { a: 123, b: true } }],
        [{ column: "value", value: { a: 432, b: false } }],
      );
      expect(result).toEqual(-1);
    });
  });
});

describe("calculateSpanSize", () => {
  it.for([
    ["at beginning", 0],
    ["inside", 2],
    ["at end", 3],
  ] as const)("one item %s", ([_, start], { expect }) => {
    expect(calculateSpanSize([1, 2, 3, 4], start)).toEqual(1);
  });

  it.for([
    ["at beginning", 0, 3],
    ["inside", 3, 2],
    ["at end", 9, 4],
  ] as const)("multiple items %s", ([_, start, expected], { expect }) => {
    expect(
      calculateSpanSize([1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4], start),
    ).toEqual(expected);
  });

  it("multiple whole array", ({ expect }) => {
    expect(calculateSpanSize([1, 1, 1, 1], 0)).toEqual(4);
  });

  it("single whole array", ({ expect }) => {
    expect(calculateSpanSize([1], 0)).toEqual(1);
  });

  it.for([
    ["empty array", [] as number[]],
    ["with items", [1, 2, 3] as number[]],
  ] as const)("handles index past end (%s)", ([_, items], { expect }) => {
    expect(calculateSpanSize(items, 5)).toEqual(0);
  });
});
