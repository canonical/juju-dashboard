import type { MockInstance } from "vitest";

import type { ConnectionWithFacades } from "juju/types";
import { authUserInfoFactory } from "testing/factories/general";

import middleware, {
  getUserCredentials,
  NO_CLOUD_FACADE,
  NOT_AUTHENTICATED_ERROR,
} from "./user-credentials";

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
  });

  it("produces user credentials for each cloud from the userCredentials call", async ({
    expect,
  }) => {
    mockUserCredentials.mockResolvedValue({
      results: [
        { result: ["cloudcred-aws_admin_aws-cred"] },
        { result: ["cloudcred-gce_user_gce-cred"] },
      ],
    });

    const result = await getUserCredentials(connection, [
      "cloud-aws",
      "cloud-gce",
    ]);
    expect(mockUserCredentials).toHaveBeenCalledExactlyOnceWith({
      "user-clouds": [
        {
          "cloud-tag": "cloud-aws",
          "user-tag": "user-eggman@external",
        },
        {
          "cloud-tag": "cloud-gce",
          "user-tag": "user-eggman@external",
        },
      ],
    });
    expect(result).toEqual({
      "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
      "cloud-gce": ["cloudcred-gce_user_gce-cred"],
    });
  });

  it("handles a cloud with no credentials returned", async ({ expect }) => {
    mockUserCredentials.mockResolvedValue({
      results: [{ result: ["cloudcred-aws_admin_aws-cred"] }, {}],
    });

    const result = await getUserCredentials(connection, [
      "cloud-aws",
      "cloud-gce",
    ]);
    expect(result).toEqual({
      "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
      "cloud-gce": [],
    });
  });

  it("leaves out clouds without a result", async ({ expect }) => {
    mockUserCredentials.mockResolvedValue({ results: [] });
    const result = await getUserCredentials(connection, ["cloud-aws"]);
    expect(mockUserCredentials).toHaveBeenCalledExactlyOnceWith({
      "user-clouds": [
        {
          "cloud-tag": "cloud-aws",
          "user-tag": "user-eggman@external",
        },
      ],
    });
    expect(result).toEqual({});
  });

  it("does not call the facade if there are no clouds", async ({ expect }) => {
    const result = await getUserCredentials(connection, []);
    expect(mockUserCredentials).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it("leaves out a cloud that failed to load so that it is looked up again", async ({
    expect,
  }) => {
    mockUserCredentials.mockResolvedValue({
      results: [
        { result: ["cloudcred-aws_admin_aws-cred"] },
        { error: { code: "unauthorized", message: "permission denied" } },
      ],
    });

    const result = await getUserCredentials(connection, [
      "cloud-aws",
      "cloud-gce",
    ]);
    expect(result).toEqual({
      "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
    });
    expect(result).not.toHaveProperty("cloud-gce");
  });

  it("throws an error if there is no identity on the connection", async ({
    expect,
  }) => {
    delete connection.info.user;
    await expect(getUserCredentials(connection, ["cloud-aws"])).rejects.toThrow(
      NOT_AUTHENTICATED_ERROR,
    );
    expect(mockUserCredentials).not.toHaveBeenCalled();
  });

  it("throws an error if the cloud facade is not available", async ({
    expect,
  }) => {
    connection.facades = {} as ConnectionWithFacades["facades"];
    await expect(getUserCredentials(connection, ["cloud-aws"])).rejects.toThrow(
      NO_CLOUD_FACADE,
    );
  });

  describe("actions", () => {
    it("start action includes `withConnection`", ({ expect }) => {
      const action = middleware.actions.start({
        wsControllerURL: "wss://example.com",
        cloudTags: ["cloud-aws"],
      });
      expect(action).toEqual(
        expect.objectContaining({
          meta: { withConnection: true },
        }),
      );
    });
  });
});
