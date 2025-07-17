import { describe, it } from "vitest";

import { parseVersion } from "./version";

describe("parseVersion", () => {
  it.for([
    ["0.0.0", { major: 0, minor: 0, patch: 0 }],
    [
      "0.0.0-alpha.0",
      {
        major: 0,
        minor: 0,
        patch: 0,
        preRelease: { identifier: "alpha", number: 0 },
      },
    ],
    [
      "0.0.0-beta.0",
      {
        major: 0,
        minor: 0,
        patch: 0,
        preRelease: { identifier: "beta", number: 0 },
      },
    ],
    [
      "1.2.3-nightly.4",
      {
        major: 1,
        minor: 2,
        patch: 3,
        preRelease: { identifier: "nightly", number: 4 },
      },
    ],
    ["0.0.x", { major: 0, minor: 0, patch: -1 }],
    ["x.x.x", { major: -1, minor: -1, patch: -1 }],
    [
      "x.x.x-beta.7",
      {
        major: -1,
        minor: -1,
        patch: -1,
        preRelease: { identifier: "beta", number: 7 },
      },
    ],
  ] as const)("%s", ([versionStr, version], { expect }) => {
    expect(parseVersion(versionStr)).toStrictEqual({
      preRelease: undefined,
      ...version,
    });
  });
});
