import type { MockInstance } from "vitest";

import type { ConnectionWithFacades } from "juju/types";
import { authUserInfoFactory } from "testing/factories/general";

import middleware, {
  getCredentialContents,
  NO_CLOUD_FACADE,
  NOT_AUTHENTICATED_ERROR,
} from "./credential-contents";

describe("getCredentialContents", () => {
  let connection: ConnectionWithFacades;
  let mockCredentialContents: MockInstance;

  beforeEach(() => {
    mockCredentialContents = vi.fn();
    connection = {
      info: {
        user: authUserInfoFactory.build(),
      },
      facades: {
        cloud: {
          credentialContents: mockCredentialContents,
        },
      },
    } as unknown as ConnectionWithFacades;
  });

  it("produces credential contents keyed by credential tag", async ({
    expect,
  }) => {
    const credentialTag = "cloudcred-aws_admin@external_name";
    const credentialResult = { result: { models: [] } };
    mockCredentialContents.mockResolvedValue({
      results: [credentialResult],
    });
    const result = await getCredentialContents(connection, [credentialTag]);

    expect(mockCredentialContents).toHaveBeenCalledExactlyOnceWith({
      credentials: [{ "cloud-name": "aws", "credential-name": "name" }],
      "include-secrets": false,
    });
    expect(result).toEqual({ [credentialTag]: credentialResult });
  });

  it("maps multiple credentials to their results by position", async ({
    expect,
  }) => {
    const awsResult = { result: { models: [] } };
    const localhostResult = { result: { models: [] } };
    mockCredentialContents.mockResolvedValue({
      results: [awsResult, localhostResult],
    });

    const result = await getCredentialContents(connection, [
      "cloudcred-aws_admin@external_aws-cred",
      // Local bootstraps do not include an `@` in the user.
      "cloudcred-localhost_admin_localhost-cred",
    ]);

    expect(mockCredentialContents).toHaveBeenCalledExactlyOnceWith({
      credentials: [
        { "cloud-name": "aws", "credential-name": "aws-cred" },
        { "cloud-name": "localhost", "credential-name": "localhost-cred" },
      ],
      "include-secrets": false,
    });
    expect(result).toEqual({
      "cloudcred-aws_admin@external_aws-cred": awsResult,
      "cloudcred-localhost_admin_localhost-cred": localhostResult,
    });
  });

  it("retains per-credential errors", async ({ expect }) => {
    const error = { error: { code: "not found", message: "not found" } };
    mockCredentialContents.mockResolvedValue({ results: [error] });

    const result = await getCredentialContents(connection, [
      "cloudcred-aws_admin_name",
    ]);
    expect(result).toEqual({ "cloudcred-aws_admin_name": error });
  });

  it("handles fewer results than credentials", async ({ expect }) => {
    const credentialResult = { result: { models: [] } };
    mockCredentialContents.mockResolvedValue({
      results: [credentialResult],
    });

    const result = await getCredentialContents(connection, [
      "cloudcred-aws_admin_one",
      "cloudcred-aws_admin_two",
    ]);
    expect(result).toEqual({
      "cloudcred-aws_admin_one": credentialResult,
      "cloudcred-aws_admin_two": {},
    });
  });

  it("handles no results returned", async ({ expect }) => {
    mockCredentialContents.mockResolvedValue({});

    const result = await getCredentialContents(connection, [
      "cloudcred-aws_admin_name",
    ]);
    expect(result).toEqual({ "cloudcred-aws_admin_name": {} });
  });

  it("handles no credentials", async ({ expect }) => {
    mockCredentialContents.mockResolvedValue({ results: [] });
    const result = await getCredentialContents(connection, []);

    expect(mockCredentialContents).toHaveBeenCalledExactlyOnceWith({
      credentials: [],
      "include-secrets": false,
    });
    expect(result).toEqual({});
  });

  it("throws an error if there is no identity on the connection", async ({
    expect,
  }) => {
    delete connection.info.user;

    await expect(
      getCredentialContents(connection, ["cloudcred-aws_admin_name"]),
    ).rejects.toThrow(NOT_AUTHENTICATED_ERROR);
    expect(mockCredentialContents).not.toHaveBeenCalled();
  });

  it("throws an error if the cloud facade is not available", async ({
    expect,
  }) => {
    connection.facades = {} as ConnectionWithFacades["facades"];

    await expect(
      getCredentialContents(connection, ["cloudcred-aws_admin_name"]),
    ).rejects.toThrow(NO_CLOUD_FACADE);
  });

  it("throws an error if the credentialContents call fails", async ({
    expect,
  }) => {
    mockCredentialContents.mockRejectedValue(new Error("something"));

    await expect(
      getCredentialContents(connection, ["cloudcred-aws_admin_name"]),
    ).rejects.toThrow("something");
  });
});

describe("actions", () => {
  it("start action includes `withConnection`", ({ expect }) => {
    const action = middleware.actions.start({
      wsControllerURL: "wss://example.com",
      credentialTags: ["cloudcred-aws_admin_name"],
    });
    expect(action).toEqual(
      expect.objectContaining({
        meta: { withConnection: true },
      }),
    );
  });
});
