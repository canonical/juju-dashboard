import type { MockInstance } from "vitest";

import type { ConnectionWithFacades } from "juju/types";

import middleware, { getCloudInfo } from "./cloud-info";

describe("getCloudInfo", () => {
  let connection: ConnectionWithFacades;
  let mockClouds: MockInstance;

  beforeEach(() => {
    mockClouds = vi.fn();
    connection = {
      facades: {
        cloud: {
          clouds: mockClouds,
        },
      },
    } as unknown as ConnectionWithFacades;
    vi.useFakeTimers();
  });

  it("produces clouds info from clouds call", async ({ expect }) => {
    mockClouds.mockResolvedValue({
      clouds: {
        "cloud-aws": { type: "ec2" },
        "cloud-gce": { type: "gce" },
      },
    });

    const result = await getCloudInfo(connection);
    expect(mockClouds).toHaveBeenCalledExactlyOnceWith({});
    expect(result).toEqual({
      "cloud-aws": { type: "ec2" },
      "cloud-gce": { type: "gce" },
    });
  });

  it("handles no clouds returned", async ({ expect }) => {
    mockClouds.mockResolvedValue({ clouds: {} });
    const result = await getCloudInfo(connection);
    expect(mockClouds).toHaveBeenCalledExactlyOnceWith({});
    expect(result).toEqual({});
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
});
