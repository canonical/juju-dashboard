import { hash } from "./hash";

describe("hash", () => {
  describe("primitive", () => {
    it.for([1, 100, 1.3, Number.EPSILON, Number.MAX_SAFE_INTEGER, -10])(
      "Number: %s",
      (num, { expect }) => {
        const nHash = hash(num);
        const otherHash = hash(num * -1);

        expect(nHash).not.toEqual(otherHash);
      },
    );

    it("NaN", () => {
      expect(hash(NaN)).toEqual(hash(NaN));
    });

    it.for(["", "something", "SOMETHING", "SoMeThInG"])(
      "String: %s",
      (string, { expect }) => {
        const stringHash = hash(string);
        const otherHash = hash(string + "ending");
        expect(stringHash).not.toEqual(otherHash);
      },
    );

    it.for([true, false])("Boolean: %s", (boolean, { expect }) => {
      const booleanHash = hash(boolean);
      const otherHash = hash(!boolean);
      expect(booleanHash).not.toEqual(otherHash);
    });
  });

  describe("array", () => {
    it.for([
      ["empty", []],
      ["single", [1]],
      ["multiple", [1, 2, 3]],
    ] as const)("%s", ([_, array]) => {
      expect(hash(array)).toEqual(hash([...array]));
    });
  });

  describe("object", () => {
    it.for([
      ["empty", {}],
      ["single", { someKey: 123 }],
      ["many", { someKey: 123, otherKey: true }],
      [
        "nested",
        { someKey: 123, otherKey: true, nested: { message: "hello" } },
      ],
    ] as const)("%s", ([_, object]) => {
      expect(hash(object)).toEqual(hash({ ...object }));
    });
  });
});
