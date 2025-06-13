import { describe, it } from "vitest";

import { getReleaseBranchInfo } from "./branch";

describe("getReleaseBranchInfo", () => {
  describe("parse release branch name", () => {
    it("with minor", ({ expect }) => {
      expect(getReleaseBranchInfo("release/1.2")).toStrictEqual({
        version: "1.2",
        majorVersion: 1,
        minorVersion: 2,
        isMajorRelease: false,
      });
    });

    it("with major", ({ expect }) => {
      expect(getReleaseBranchInfo("release/1.0")).toStrictEqual({
        version: "1.0",
        majorVersion: 1,
        minorVersion: 0,
        isMajorRelease: true,
      });
    });

    it("with zeros", ({ expect }) => {
      expect(getReleaseBranchInfo("release/0.0")).toStrictEqual({
        version: "0.0",
        majorVersion: 0,
        minorVersion: 0,
        isMajorRelease: true,
      });
    });
  });

  describe("rejects malformed branch name", () => {
    it("with patch component", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/5.6.3")).toThrow(
        "malformed release branch name",
      );
    });

    it("with single component", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/1")).toThrow(
        "malformed release branch name",
      );
    });

    it("with no component", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/")).toThrow(
        "malformed release branch name",
      );
    });

    it("with empty major component", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/.1")).toThrow(
        "malformed release branch name",
      );
    });

    it("with empty minor component", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/1.")).toThrow(
        "malformed release branch name",
      );
    });

    it("with empty components", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/.")).toThrow(
        "malformed release branch name",
      );
    });

    it("with non-number components", ({ expect }) => {
      expect(() => getReleaseBranchInfo("release/a.b")).toThrow(
        "malformed release branch name",
      );
    });
  });

  describe("ignore non-release branch", () => {
    it("without `release/` prefix", ({ expect }) => {
      expect(getReleaseBranchInfo("something/1.2")).toBeNull();
    });

    it("starting with `release`", ({ expect }) => {
      expect(getReleaseBranchInfo("release-1.2.3")).toBeNull();
    });

    it("with simple branch name", ({ expect }) => {
      expect(getReleaseBranchInfo("main")).toBeNull();
    });
  });
});
