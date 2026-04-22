import type { MockInstance } from "vitest";

import * as jimmApi from "juju/jimm/api";
import type { ConnectionWithFacades } from "juju/types";

import middleware, { getSupportedVersions } from "./jimm-supported-versions";

describe("getMigrationTargets", () => {
  const connection = {} as ConnectionWithFacades;
  let supportedJujuVersions: MockInstance;

  beforeEach(() => {
    supportedJujuVersions = vi.spyOn(jimmApi, "supportedJujuVersions");
    vi.useFakeTimers();
  });

  it("returns versions", async ({ expect }) => {
    const versions = [
      {
        version: "1.2.3",
        date: "2026-01-01T00:00:00Z",
        "link-to-release": "https://example.com",
      },
      {
        version: "4.5.6",
        date: "2026-02-02T00:00:00Z",
        "link-to-release": "https://example.com",
      },
    ];
    supportedJujuVersions.mockResolvedValue({
      versions,
    });

    const result = await getSupportedVersions(connection);
    expect(supportedJujuVersions).toHaveBeenCalledExactlyOnceWith(connection);
    expect(result).toEqual(versions);
  });

  it("handles no versions returned", async ({ expect }) => {
    supportedJujuVersions.mockResolvedValue({
      versions: [],
    });

    const result = await getSupportedVersions(connection);
    expect(supportedJujuVersions).toHaveBeenCalledExactlyOnceWith(connection);
    expect(result).toEqual([]);
  });
});

describe("actions", () => {
  it("start action includes `withConnection`", ({ expect }) => {
    const action = middleware.actions.start({
      wsControllerURL: "wss://example.com",
    });
    expect(action).toEqual(
      expect.objectContaining({
        meta: { withConnection: true },
      }),
    );
  });
});
