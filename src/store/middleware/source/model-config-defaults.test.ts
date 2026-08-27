import type { MockInstance } from "vitest";

import type { ConnectionWithFacades } from "juju/types";
import { modelConfigSchemaFieldFactory } from "testing/factories/juju/CloudV8";

import middleware, { getModelConfigDefaults } from "./model-config-defaults";

describe("getModelConfigDefaults", () => {
  let connection: ConnectionWithFacades;
  let mockModelDefaultsForClouds: MockInstance;
  let mockModelConfigSchema: MockInstance;

  beforeEach(() => {
    mockModelDefaultsForClouds = vi.fn().mockResolvedValue({ results: [] });
    mockModelConfigSchema = vi.fn().mockResolvedValue({ schema: undefined });
    connection = {
      facades: {
        modelManager: {
          modelDefaultsForClouds: mockModelDefaultsForClouds,
        },
        cloud: {
          modelConfigSchema: mockModelConfigSchema,
        },
      },
    } as unknown as ConnectionWithFacades;
    vi.useFakeTimers();
  });

  it("calls both facades in parallel when schema is available", async ({
    expect,
  }) => {
    await getModelConfigDefaults(connection, "cloud-aws", "ec2");
    expect(mockModelDefaultsForClouds).toHaveBeenCalledExactlyOnceWith({
      entities: [{ tag: "cloud-aws" }],
    });
    expect(mockModelConfigSchema).toHaveBeenCalledExactlyOnceWith({
      "provider-type": "ec2",
    });
  });

  it("returns an empty array and skips both calls when modelConfigSchema is not available on the facade", async ({
    expect,
  }) => {
    connection = {
      ...connection,
      facades: { ...connection.facades, cloud: {} },
    } as unknown as ConnectionWithFacades;
    const result = await getModelConfigDefaults(connection, "cloud-aws", "ec2");
    expect(result).toStrictEqual([]);
    expect(mockModelDefaultsForClouds).not.toHaveBeenCalled();
    expect(mockModelConfigSchema).not.toHaveBeenCalled();
  });

  it("returns category definitions combining schema and defaults", async ({
    expect,
  }) => {
    mockModelDefaultsForClouds.mockResolvedValue({
      results: [
        {
          config: {
            "default-space": {
              default: "my-space",
            },
          },
        },
      ],
    });
    mockModelConfigSchema.mockResolvedValue({
      schema: {
        "default-space": modelConfigSchemaFieldFactory.build({
          type: "string",
          description: "The default network space",
        }),
      },
    });

    const result = await getModelConfigDefaults(connection, "cloud-aws", "ec2");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      label: "default-space",
      description: "The default network space",
      defaultValue: "my-space",
      value: "my-space",
      arrayIndex: 0,
      category: null,
    });
  });

  it("passes the selected region through to generateFieldEntries", async ({
    expect,
  }) => {
    mockModelDefaultsForClouds.mockResolvedValue({
      results: [
        {
          config: {
            "default-space": {
              regions: [
                {
                  "region-name": "us-east-1",
                  value: "region-space",
                },
              ],
            },
          },
        },
      ],
    });
    mockModelConfigSchema.mockResolvedValue({
      schema: {
        "default-space": modelConfigSchemaFieldFactory.build({
          type: "string",
        }),
      },
    });

    const result = await getModelConfigDefaults(
      connection,
      "cloud-aws",
      "ec2",
      "us-east-1",
    );
    expect(result[0].defaultValue).toBe("region-space");
  });

  it("throws a combined error if both calls fail", async ({ expect }) => {
    mockModelDefaultsForClouds.mockRejectedValue("defaults error");
    mockModelConfigSchema.mockRejectedValue("schema error");
    await expect(
      getModelConfigDefaults(connection, "cloud-aws", "ec2"),
    ).rejects.toThrow(
      "Failed to fetch model config defaults and schema: defaults error; schema error",
    );
  });

  it("throws if only the defaults call fails", async ({ expect }) => {
    mockModelDefaultsForClouds.mockRejectedValue("defaults error");
    await expect(
      getModelConfigDefaults(connection, "cloud-aws", "ec2"),
    ).rejects.toThrow("Failed to fetch model config defaults: defaults error");
  });

  it("throws if only the schema call fails", async ({ expect }) => {
    mockModelConfigSchema.mockRejectedValue("schema error");
    await expect(
      getModelConfigDefaults(connection, "cloud-aws", "ec2"),
    ).rejects.toThrow("Failed to fetch model config schema: schema error");
  });

  describe("actions", () => {
    it("start action includes `withConnection`", ({ expect }) => {
      const action = middleware.actions.start({
        wsControllerURL: "wss://example.com",
        cloudTag: "cloud-aws",
        providerType: "ec2",
      });
      expect(action).toEqual(
        expect.objectContaining({
          meta: { withConnection: true },
        }),
      );
    });
  });
});
