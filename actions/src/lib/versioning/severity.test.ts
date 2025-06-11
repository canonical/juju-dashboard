import { describe, it } from "vitest";

import { severityFits, severityFromVersion } from "./severity";

describe("severityFits", () => {
  it("minor in major", ({ expect }) => {
    expect(severityFits("major", "minor")).toBe(true);
  });

  it("major in major", ({ expect }) => {
    expect(severityFits("major", "major")).toBe(true);
  });

  it("minor in minor", ({ expect }) => {
    expect(severityFits("minor", "minor")).toBe(true);
  });

  it("major not in minor", ({ expect }) => {
    expect(severityFits("minor", "major")).toBe(false);
  });
});

describe("severityFromVersion", () => {
  it("handles patch", ({ expect }) => {
    expect(severityFromVersion("patch")).toEqual("minor");
  });

  it("handles minor", ({ expect }) => {
    expect(severityFromVersion("minor")).toEqual("minor");
  });

  it("handles major", ({ expect }) => {
    expect(severityFromVersion("major")).toEqual("major");
  });
});
