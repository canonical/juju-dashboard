import { describe, it } from "vitest";

import {
  getUnreleasedEntries,
  getVersionEntries,
  releaseVersion,
} from "./changelog-md";

describe("changelog-md", () => {
  describe("getUnreleasedEntries", () => {
    it("returns the items under ## Unreleased", ({ expect }) => {
      const content = `# Changelog

## Unreleased
- first change
- second change

## [0.0.1]
- old change
`;
      expect(getUnreleasedEntries(content)).toStrictEqual([
        "first change",
        "second change",
      ]);
    });

    it("returns an empty array when ## Unreleased has no items", ({
      expect,
    }) => {
      const content = `# Changelog

## Unreleased

## [0.0.1]
- old change
`;
      expect(getUnreleasedEntries(content)).toStrictEqual([]);
    });

    it("is case-insensitive for the Unreleased header", ({ expect }) => {
      const content = `# Changelog

## UNRELEASED
- first change
`;
      expect(getUnreleasedEntries(content)).toStrictEqual(["first change"]);
    });
  });

  describe("getVersionEntries", () => {
    it("returns the items under the requested version", ({ expect }) => {
      const content = `# Changelog

## Unreleased
- unreleased change

## [0.0.2-beta.0]
- beta change

## [0.0.1]
- stable change
`;
      expect(getVersionEntries(content, "0.0.2-beta.0")).toStrictEqual([
        "beta change",
      ]);
      expect(getVersionEntries(content, "0.0.1")).toStrictEqual([
        "stable change",
      ]);
    });

    it("returns an empty array when the version does not exist", ({
      expect,
    }) => {
      const content = `# Changelog

## Unreleased
`;
      expect(getVersionEntries(content, "0.0.1")).toStrictEqual([]);
    });
  });

  describe("releaseVersion", () => {
    it("moves Unreleased entries into a new beta section", ({ expect }) => {
      const content = `# Changelog

## Unreleased
- first change
- second change
`;
      const { content: updated, entryItems } = releaseVersion(
        content,
        "0.0.1-beta.0",
        "beta",
      );

      expect(entryItems).toStrictEqual(["first change", "second change"]);
      expect(updated).toEqual(`# Changelog

## Unreleased

## [0.0.1-beta.0]
- first change
- second change
`);
    });

    it("keeps Unreleased empty when there are no entries", ({ expect }) => {
      const content = `# Changelog

## Unreleased

## [0.0.1]
- old change
`;
      const { content: updated, entryItems } = releaseVersion(
        content,
        "0.0.2-beta.0",
        "beta",
      );

      expect(entryItems).toStrictEqual([]);
      expect(updated).toEqual(`# Changelog

## Unreleased

## [0.0.2-beta.0]

## [0.0.1]
- old change
`);
    });

    it("collects beta sections since the previous stable for a stable release", ({
      expect,
    }) => {
      const content = `# Changelog

## Unreleased
- final change

## [0.0.2-beta.1]
- second beta

## [0.0.2-beta.0]
- first beta

## [0.0.1]
- stable change
`;
      const { content: updated, entryItems } = releaseVersion(
        content,
        "0.0.2",
        "stable",
      );

      expect(entryItems).toStrictEqual([
        "final change",
        "second beta",
        "first beta",
      ]);
      expect(updated).toEqual(`# Changelog

## Unreleased

## [0.0.2]
- final change
- second beta
- first beta

## [0.0.2-beta.1]
- second beta

## [0.0.2-beta.0]
- first beta

## [0.0.1]
- stable change
`);
    });

    it("collects all beta sections when there is no previous stable", ({
      expect,
    }) => {
      const content = `# Changelog

## Unreleased
- final change

## [0.0.1-beta.1]
- second beta

## [0.0.1-beta.0]
- first beta
`;
      const { content: updated, entryItems } = releaseVersion(
        content,
        "0.0.1",
        "stable",
      );

      expect(entryItems).toStrictEqual([
        "final change",
        "second beta",
        "first beta",
      ]);
      expect(updated).toContain("## [0.0.1]");
      expect(updated).toContain("## [0.0.1-beta.1]");
      expect(updated).toContain("## [0.0.1-beta.0]");
    });
  });
});
