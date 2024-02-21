import { toErrorString } from "utils";

describe("toErrorString", () => {
  it("handles error objects", () => {
    expect(toErrorString(new Error("Uh oh!"))).toBe("Uh oh!");
  });

  it("handles error strings", () => {
    expect(toErrorString("Uh oh!")).toBe("Uh oh!");
  });

  it("handles unknown errors", () => {
    expect(toErrorString(false)).toBe("Unknown error");
  });
});
