import { toErrorString } from "utils";

import { Label } from "./toErrorString";

describe("toErrorString", () => {
  it("handles error objects", () => {
    expect(toErrorString(new Error("Uh oh!"))).toBe("Uh oh!");
  });

  it("handles error strings", () => {
    expect(toErrorString("Uh oh!")).toBe("Uh oh!");
  });

  it("handles unknown errors", () => {
    expect(toErrorString(false)).toBe(Label.UNKNOWN_ERROR);
  });
});
