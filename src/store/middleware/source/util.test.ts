import type { ModelDefaultsResult } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";

import { BOOLEAN_OPTIONS } from "consts";
import { InputType, ValueType } from "pages/AddModel/ConfigsConstraints/types";
import { modelConfigSchemaFieldFactory } from "testing/factories/juju/CloudV8";

import { generateFieldEntries } from "./util";

describe("generateFieldEntries", () => {
  it("returns an empty array for an empty schema", () => {
    const result = generateFieldEntries({}, {});
    expect(result).toHaveLength(0);
  });

  it.each(["name", "type", "uuid"])(
    'skips the reserved "%s" field',
    (label) => {
      const result = generateFieldEntries(
        {
          [label]: modelConfigSchemaFieldFactory.build(),
          "default-space": modelConfigSchemaFieldFactory.build(),
        },
        {},
      );
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("default-space");
    },
  );

  it("returns null category for all entries when API provides no grouping", () => {
    const result = generateFieldEntries(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      {},
    );
    expect(result[0].category).toBeNull();
  });

  it("stamps arrayIndex and value on each entry", () => {
    const config: ModelDefaultsResult["config"] = {
      "default-space": {
        // The API types these values as `AdditionalProperties` but they are
        // plain primitives at runtime.
        default: "my-space" as unknown as Record<string, unknown>,
      },
    };
    const result = generateFieldEntries(
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
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      label: "default-space",
      description: "The default network space",
      defaultValue: "my-space",
      value: "my-space",
      arrayIndex: 0,
    });
    expect(result[1]).toMatchObject({
      valueType: ValueType.BOOLEAN,
      arrayIndex: 1,
    });
    expect(result[2]).toMatchObject({
      valueType: ValueType.NUMBER,
      arrayIndex: 2,
    });
  });

  it("leaves defaultValue undefined and value '' when field has no default", () => {
    const result = generateFieldEntries(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      {},
    );
    expect(result[0].defaultValue).toBeUndefined();
    expect(result[0].value).toBe("");
  });

  it("prefers controller override over other defaults", () => {
    const config: ModelDefaultsResult["config"] = {
      "default-space": {
        // The API types these values as `AdditionalProperties` but they are
        // plain primitives at runtime.
        default: "default-space" as unknown as Record<string, unknown>,
        controller: "controller-space" as unknown as Record<string, unknown>,
        regions: [
          {
            "region-name": "us-east-1",
            value: "us-east-space" as unknown as Record<string, unknown>,
          },
        ],
      },
    };
    const result = generateFieldEntries(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      config,
    );
    expect(result[0].defaultValue).toBe("controller-space");
    expect(result[0].value).toBe("controller-space");
  });

  it("applies region default when region is provided and controller defaults are absent", () => {
    const config: ModelDefaultsResult["config"] = {
      "default-space": {
        // The API types these values as `AdditionalProperties` but they are
        // plain primitives at runtime.
        default: "global-default" as unknown as Record<string, unknown>,
        regions: [
          {
            "region-name": "us-east-1",
            value: "us-east-space" as unknown as Record<string, unknown>,
          },
        ],
      },
    };
    const result = generateFieldEntries(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      config,
      "us-east-1",
    );
    expect(result[0].defaultValue).toBe("us-east-space");
  });

  it("falls back to juju-wide default when other defaults are absent", () => {
    const result = generateFieldEntries(
      { "default-space": modelConfigSchemaFieldFactory.build() },
      {
        "default-space": {
          // The API types these values as `AdditionalProperties` but they are
          // plain primitives at runtime.
          default: "global-default" as unknown as Record<string, unknown>,
        },
      },
    );
    expect(result[0].defaultValue).toBe("global-default");
  });

  it("handles bool type properly", () => {
    const result = generateFieldEntries(
      {
        "disable-network-management": modelConfigSchemaFieldFactory.build({
          type: "bool",
        }),
      },
      {},
    );
    expect(result[0].valueType).toBe(ValueType.BOOLEAN);
    expect(result[0].input?.type).toBe(InputType.SELECT);
    expect(result[0].input?.options).toEqual(BOOLEAN_OPTIONS);
  });

  it.each(["int", "float"])("handles %s type properly", (type) => {
    const result = generateFieldEntries(
      { "some-field": modelConfigSchemaFieldFactory.build({ type }) },
      {},
    );
    expect(result[0].valueType).toBe(ValueType.NUMBER);
    expect(result[0].input).toBeUndefined();
  });

  it("sets a select input with options when values are present", () => {
    const result = generateFieldEntries(
      {
        "firewall-mode": modelConfigSchemaFieldFactory.build({
          type: "string",
          // Values are typed as `object[]` by Juju but are plain primitives
          // at runtime, which is why we cast here to reflect the real shape.
          values: ["instance", "global", "none"] as unknown as object[],
        }),
      },
      {},
    );
    expect(result[0].input?.type).toBe(InputType.SELECT);
    expect(result[0].input?.options).toEqual([
      { label: "instance", value: "instance" },
      { label: "global", value: "global" },
      { label: "none", value: "none" },
    ]);
  });

  it("filters out values that do not match the declared field type", () => {
    const result = generateFieldEntries(
      {
        "firewall-mode": modelConfigSchemaFieldFactory.build({
          type: "string",
          // Values are typed as `object[]` by Juju but are plain primitives
          // at runtime, which is why we cast here to reflect the real shape.
          values: ["instance", 42, null, "global"] as unknown as object[],
        }),
      },
      {},
    );
    expect(result[0].input?.options).toEqual([
      { label: "instance", value: "instance" },
      { label: "global", value: "global" },
    ]);
  });
});
