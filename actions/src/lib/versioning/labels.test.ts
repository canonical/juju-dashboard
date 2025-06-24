import { describe, it } from "vitest";

import {
  versionFromLabels,
  changelogFromLabels,
  severityFromLabels,
} from "./labels";

describe("versionFromLabels", () => {
  describe("produce version", () => {
    it("patch pull request", ({ expect }) => {
      expect(versionFromLabels(["version: patch"])).toEqual("patch");
    });

    it("minor pull request", ({ expect }) => {
      expect(versionFromLabels(["version: minor"])).toEqual("minor");
    });

    it("major pull request", ({ expect }) => {
      expect(versionFromLabels(["version: major"])).toEqual("major");
    });

    it("ignoring other labels", ({ expect }) => {
      expect(
        versionFromLabels([
          "version: patch",
          "changelog",
          "random label",
          "something else",
        ]),
      ).toEqual("patch");
    });
  });

  describe("produce nothing", () => {
    it("handles no labels", ({ expect }) => {
      expect(versionFromLabels([])).toEqual(null);
    });

    it("handles no version labels", ({ expect }) => {
      expect(versionFromLabels(["component-a", "component-b"])).toEqual(null);
    });

    it("with multiple version labels", ({ expect }) => {
      expect(() =>
        versionFromLabels(["version: major", "version: minor"]),
      ).toThrow("multiple version labels detected");
    });
  });
});

describe("changelogFromLabels", () => {
  it("detects changelog label", ({ expect }) => {
    expect(changelogFromLabels(["changelog"])).toEqual(true);
  });

  it("detects changelog label with other labels", ({ expect }) => {
    expect(
      changelogFromLabels(["changelog", "component-a", "component-b"]),
    ).toEqual(true);
  });

  it("ignores other labels", ({ expect }) => {
    expect(changelogFromLabels(["component-a", "component-b"])).toEqual(false);
  });

  it("handles no labels", ({ expect }) => {
    expect(changelogFromLabels([])).toEqual(false);
  });
});

describe("severityFromLabels", () => {
  it("detects major", ({ expect }) => {
    expect(severityFromLabels(["release-severity: major"])).toEqual("major");
  });

  it("detects minor", ({ expect }) => {
    expect(severityFromLabels(["release-severity: minor"])).toEqual("minor");
  });

  it("ignores other labels", ({ expect }) => {
    expect(
      severityFromLabels(["release-severity: major", "component-a"]),
    ).toEqual("major");
  });

  it("handles no release labels", ({ expect }) => {
    expect(severityFromLabels(["component-a", "component-b"])).toBe(null);
  });
});
