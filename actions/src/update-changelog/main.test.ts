import { describe, it } from "vitest";

import { message } from "./main";

describe("message", () => {
  it("says nice message", ({ expect }) => {
    const theMessage = message();

    expect(theMessage).toEqual("running!");
  });
});
