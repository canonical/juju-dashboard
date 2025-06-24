import { describe, it } from "vitest";

import { versioningInfoFromBranch } from "./branch";

describe("versioningInfoFromBranch", () => {
  it.for([
    ["release/1.2", 1, 2, false],
    ["release/1.0", 1, 0, true],
    ["release/0.0", 0, 0, true],
  ] as const)(
    "parse branch name: %s",
    ([branch, majorVersion, minorVersion, isMajorRelease], { expect }) => {
      expect(versioningInfoFromBranch(branch)).toStrictEqual({
        version: `${majorVersion}.${minorVersion}`,
        majorVersion,
        minorVersion,
        isMajorRelease,
      });
    },
  );

  it.for([
    "release/5.6.3",
    "release/1",
    "release/",
    "release/.1",
    "release/1.",
    "release/.",
    "release/a.b",
  ])("rejects malformed branch name: %s", (branch, { expect }) => {
    expect(() => versioningInfoFromBranch(branch)).toThrow(
      "malformed release branch name",
    );
  });

  it.for(["something/1.2", "release-1.2.3", "main"])(
    "ignore non-release branch: %s",
    (branch, { expect }) => {
      expect(versioningInfoFromBranch(branch)).toBeNull();
    },
  );
});
