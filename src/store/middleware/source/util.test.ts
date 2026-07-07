import type { ModelDefaultsResult } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";

import { BOOLEAN_OPTIONS, FALLBACK_CATEGORY } from "consts";
import { modelConfigSchemaFieldFactory } from "testing/factories/juju/CloudV8";

import { generateCategoryDefinitions } from "./util";

describe("generateCategoryDefinitions", () => {
  it("returns a single category with the FALLBACK_CATEGORY sentinel", () => {
    const result = generateCategoryDefinitions({}, {});
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe(FALLBACK_CATEGORY);
  });

  it("returns an empty fields array for an empty schema", () => {
    const result = generateCategoryDefinitions({}, {});
    expect(result[0].fields).toHaveLength(0);
  });

  it("handles multiple fields in the schema", () => {
    const config: ModelDefaultsResult["config"] = {
      "default-space": { default: { value: "my-space" } },
    };
    const result = generateCategoryDefinitions(
      {
        "default-space": modelConfigSchemaFieldFactory.build({
          type: "string",
          description: "The default network space",
        }),
        "disable-network-management": modelConfigSchemaFieldFactory.build({
          type: "bool",
        }),
        "net-bond-reconfigure-delay": modelConfigSchemaFieldFactory.build({
          type: "int",
        }),
      },
      config,
    );
    expect(result[0].fields).toHaveLength(3);
    expect(result[0].fields[0].label).toBe("default-space");
    expect(result[0].fields[0].description).toBe("The default network space");
    expect(result[0].fields[0].defaultValue).toBe("my-space");
    expect(result[0].fields[1].valueType).toBe("boolean");
    expect(result[0].fields[2].valueType).toBe("number");
  });

  it("leaves defaultValue undefined when field has no default", () => {
    const result = generateCategoryDefinitions(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      {},
    );
    expect(result[0].fields[0].defaultValue).toBeUndefined();
  });

  it("prefers controller override over other defaults", () => {
    const config: ModelDefaultsResult["config"] = {
      "default-space": {
        default: { value: "default-space" },
        controller: { value: "controller-space" },
        regions: [
          { "region-name": "us-east-1", value: { value: "us-east-space" } },
        ],
      },
    };
    const result = generateCategoryDefinitions(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      config,
    );
    expect(result[0].fields[0].defaultValue).toBe("controller-space");
  });

  it("applies region default when region is provided and controller defaults are absent", () => {
    const config: ModelDefaultsResult["config"] = {
      "default-space": {
        default: { value: "global-default" },
        regions: [
          { "region-name": "us-east-1", value: { value: "us-east-space" } },
        ],
      },
    };
    const result = generateCategoryDefinitions(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      config,
      "us-east-1",
    );
    expect(result[0].fields[0].defaultValue).toBe("us-east-space");
  });

  it("falls back to juju-wide default when other defaults are absent", () => {
    const result = generateCategoryDefinitions(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      {
        "default-space": {
          default: { value: "global-default" },
          regions: [
            { "region-name": "us-east-1", value: { value: "us-east-space" } },
          ],
        },
      },
    );
    expect(result[0].fields[0].defaultValue).toBe("global-default");
  });

  it("handles bool type properly", () => {
    const result = generateCategoryDefinitions(
      {
        "disable-network-management": modelConfigSchemaFieldFactory.build({
          type: "bool",
        }),
      },
      {},
    );
    expect(result[0].fields[0].valueType).toBe("boolean");
    expect(result[0].fields[0].input?.type).toBe("select");
    expect(result[0].fields[0].input?.options).toEqual(BOOLEAN_OPTIONS);
  });

  it.each(["int", "float"])("handles %s type properly", (type) => {
    const result = generateCategoryDefinitions(
      { "some-field": modelConfigSchemaFieldFactory.build({ type }) },
      {},
    );
    expect(result[0].fields[0].valueType).toBe("number");
    expect(result[0].fields[0].input).toBeUndefined();
  });

  it("sets a select input with options when values are present", () => {
    const result = generateCategoryDefinitions(
      {
        "firewall-mode": modelConfigSchemaFieldFactory.build({
          type: "string",
          values: ["instance", "global", "none"] as unknown as object[],
        }),
      },
      {},
    );
    expect(result[0].fields[0].input?.type).toBe("select");
    expect(result[0].fields[0].input?.options).toEqual([
      { label: "instance", value: "instance" },
      { label: "global", value: "global" },
      { label: "none", value: "none" },
    ]);
  });
});
