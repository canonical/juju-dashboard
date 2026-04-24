import type { CategoryDefinition } from "./configCatalog";
import {
  buildConfigYAML,
  getChangedFields,
  isConfigChanged,
  validateAndParseConfigYAML,
} from "./utils";

describe("utils", () => {
  describe("isConfigChanged", () => {
    it("returns false when value is undefined", () => {
      const result = isConfigChanged("some-label", {}, "default-value");

      expect(result).toBe(false);
    });

    it("returns false when value matches the default value", () => {
      const result = isConfigChanged(
        "some-label",
        { "some-label": "default-value" },
        "default-value",
      );

      expect(result).toBe(false);
    });

    it("returns true when value differs from the default value", () => {
      const result = isConfigChanged(
        "some-label",
        { "some-label": "different-value" },
        "default-value",
      );

      expect(result).toBe(true);
    });

    it("returns true when value is non-empty and no default is provided", () => {
      const result = isConfigChanged(
        "some-label",
        { "some-label": "some-value" },
        undefined,
      );

      expect(result).toBe(true);
    });
  });

  describe("getChangedFields", () => {
    const category: CategoryDefinition = {
      category: "Networking",
      fields: [
        {
          label: "default-space",
          defaultValue: "alpha",
          description: "Default space",
        },
        {
          label: "container-networking-method",
          defaultValue: "provider",
          description: "Networking method",
        },
        {
          label: "logging-config",
          defaultValue: "",
          description: "Logging config",
        },
      ],
    };

    it("returns all fields when onlyChanged is false", () => {
      const result = getChangedFields(category, false, {
        "default-space": "modified-space",
      });

      expect(result).toHaveLength(3);
      expect(result).toEqual(category.fields);
    });

    it("filters to only changed fields when onlyChanged is true", () => {
      const result = getChangedFields(category, true, {
        "default-space": "modified-space",
        "container-networking-method": "provider",
        "logging-config": "debug",
      });

      expect(result).toHaveLength(2);
      expect(result.map((field) => field.label)).toEqual([
        "default-space",
        "logging-config",
      ]);
    });

    it("returns empty array when no fields have changed", () => {
      const result = getChangedFields(category, true, {
        "default-space": "alpha",
        "container-networking-method": "provider",
        "logging-config": "",
      });

      expect(result).toHaveLength(0);
    });
  });

  describe("buildConfigYAML", () => {
    const categories: CategoryDefinition[] = [
      {
        category: "Networking",
        fields: [
          {
            label: "default-space",
            defaultValue: "alpha",
            description: "Default space",
          },
          {
            label: "container-networking-method",
            defaultValue: "provider",
            description: "Networking method",
          },
        ],
      },
      {
        category: "Logging",
        fields: [
          {
            label: "logging-config",
            defaultValue: "",
            description: "Logging config",
          },
          {
            label: "logging-level",
            defaultValue: "warning",
            description: "Logging level",
          },
        ],
      },
    ];

    it("returns empty string when no fields have changed", () => {
      const result = buildConfigYAML(categories, {});

      expect(result).toBe("");
    });

    it("builds YAML with category headers and field values", () => {
      const result = buildConfigYAML(categories, {
        "default-space": "custom-space",
      });

      expect(result).toContain("# Networking");
      expect(result).toContain("default-space: custom-space");
      expect(result).not.toContain("# Logging");
    });

    it("includes multiple categories separated by blank lines", () => {
      const result = buildConfigYAML(categories, {
        "default-space": "custom-space",
        "logging-config": "debug",
      });

      const sections = result.split("\n\n");
      expect(sections).toHaveLength(2);
      expect(sections[0]).toContain("# Networking");
      expect(sections[1]).toContain("# Logging");
    });

    it("includes only changed fields in the output", () => {
      const result = buildConfigYAML(categories, {
        "default-space": "custom-space",
        "container-networking-method": "provider",
        "logging-config": "debug",
        "logging-level": "warning",
      });

      expect(result).toContain("default-space: custom-space");
      expect(result).not.toContain("container-networking-method");
      expect(result).toContain("logging-config: debug");
      expect(result).not.toContain("logging-level");
    });
  });

  describe("validateAndParseConfigYAML", () => {
    const categories: CategoryDefinition[] = [
      {
        category: "Networking",
        fields: [
          {
            label: "container-networking-method",
            defaultValue: "local",
            description: "Networking method",
            input: {
              type: "select",
              options: [
                { label: "local", value: "local" },
                { label: "fan", value: "fan" },
              ],
            },
          },
          {
            label: "net-bond-reconfigure-delay",
            defaultValue: "17",
            description: "Delay",
          },
        ],
      },
    ];

    it("returns line-level format error for invalid YAML line", () => {
      const result = validateAndParseConfigYAML(
        "container-networking-method local",
        categories,
      );

      expect(result.values).toEqual({});
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(1);
      expect(result.errors[0].message).toContain("Invalid format");
    });

    it("returns error for unknown key", () => {
      const result = validateAndParseConfigYAML(
        "unknown-key: value",
        categories,
      );

      expect(result.values).toEqual({});
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("Unknown key");
    });

    it("returns error for invalid select value", () => {
      const result = validateAndParseConfigYAML(
        "container-networking-method: invalid",
        categories,
      );

      expect(result.values).toEqual({});
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("Expected one of");
    });

    it("returns error for invalid numeric type", () => {
      const result = validateAndParseConfigYAML(
        "net-bond-reconfigure-delay: invalid-number",
        categories,
      );

      expect(result.values).toEqual({});
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("Expected a number");
    });
  });
});
