import { AccessLevel } from "types";

import { bumpAccessLevel } from "./getAccessLevel";

describe("bumpAccessLevel", () => {
  it("returns the next higher access level", () => {
    expect(bumpAccessLevel(AccessLevel.READ)).toBe(AccessLevel.WRITE);
    expect(bumpAccessLevel(AccessLevel.WRITE)).toBe(AccessLevel.ADMIN);
    expect(bumpAccessLevel(AccessLevel.ADMIN)).toBe(AccessLevel.ADMIN);
  });
});
