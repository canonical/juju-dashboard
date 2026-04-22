import type { MockInstance } from "vitest";

import type { ConnectionWithFacades } from "juju/types";
import { authUserInfoFactory } from "testing/factories/general";

import middleware, { getUserCredentials } from "./user-credentials";

describe("getUserCredentials", () => {
  let connection: ConnectionWithFacades;
  let mockUserCredentials: MockInstance;

  beforeEach(() => {
    mockUserCredentials = vi.fn();
    connection = {
      info: {
        user: authUserInfoFactory.build(),
      },
      facades: {
        cloud: {
          userCredentials: mockUserCredentials,
        },
      },
    } as unknown as ConnectionWithFacades;
    vi.useFakeTimers();
  });

  it("produces user credentials from userCredentials call", async ({
    expect,
  }) => {
    mockUserCredentials.mockResolvedValue({
      results: [
        {
          result: {
            "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
            "cloud-gce": ["cloudcred-gce_user_gce-cred"],
          },
        },
      ],
    });

    const result = await getUserCredentials(connection, "cloud-aws");
    expect(mockUserCredentials).toHaveBeenCalledExactlyOnceWith({
      "user-clouds": [
        {
          "cloud-tag": "cloud-aws",
          "user-tag": "user-eggman@external",
        },
      ],
    });
    expect(result).toEqual({
      "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
      "cloud-gce": ["cloudcred-gce_user_gce-cred"],
    });
  });

  it("handles no credentials returned", async ({ expect }) => {
    mockUserCredentials.mockResolvedValue({ results: [] });
    const result = await getUserCredentials(connection, "cloud-aws");
    expect(mockUserCredentials).toHaveBeenCalledExactlyOnceWith({
      "user-clouds": [
        {
          "cloud-tag": "cloud-aws",
          "user-tag": "user-eggman@external",
        },
      ],
    });
    expect(result).toEqual([]);
  });

  describe("actions", () => {
    it("start action includes `withConnection`", ({ expect }) => {
      const action = middleware.actions.start({
        wsControllerURL: "wss://example.com",
        cloudTag: "cloud-aws",
      });
      expect(action).toEqual(
        expect.objectContaining({
          meta: { withConnection: true },
        }),
      );
    });
  });
});
