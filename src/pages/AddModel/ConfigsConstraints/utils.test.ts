import type { CategoryDefinition } from "./types";
import {
  buildConfigsConstraintsPayload,
  buildYAML,
  filterCategoriesBySearch,
  getChangedFields,
  getCategoriesWithVisibleFields,
  getConfigInitialValues,
  isConfigChanged,
  validateAndParseYAML,
} from "./utils";

describe("utils", () => {
  let categories: CategoryDefinition[];

  beforeEach(() => {
    categories = [
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
        category: "Compute",
        fields: [
          {
            label: "cores",
            description: "Number of cores",
            isNumeric: true,
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
        ],
      },
    ];
  });

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

    it("returns true when a numeric value has no default", () => {
      const result = isConfigChanged(
        "some-label",
        { "some-label": 0 },
        undefined,
      );
      expect(result).toBe(true);
    });

    it("returns false when a numeric value matches a numeric default", () => {
      const result = isConfigChanged("some-label", { "some-label": 0 }, 0);
      expect(result).toBe(false);
    });

    it("returns false when a boolean value matches the default", () => {
      const result = isConfigChanged(
        "some-label",
        { "some-label": false },
        false,
      );
      expect(result).toBe(false);
    });

    it("returns true when a boolean value differs from the default", () => {
      const result = isConfigChanged(
        "some-label",
        { "some-label": true },
        false,
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

    it("returns empty array when nothing has changed", () => {
      const result = getChangedFields(category, {
        "default-space": "alpha",
        "container-networking-method": "provider",
        "logging-config": "",
      });
      expect(result).toEqual([]);
    });

    it("filters changed fields", () => {
      const result = getChangedFields(category, {
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
  });

  describe("buildYAML", () => {
    it("returns empty string when no fields have changed", () => {
      const result = buildYAML(categories, {});
      expect(result).toBe("");
    });

    it("builds YAML with category headers and field values", () => {
      const result = buildYAML(categories, {
        "default-space": "custom-space",
      });

      expect(result).toContain("# Networking");
      expect(result).toContain("default-space: custom-space");
      expect(result).not.toContain("# Logging");
    });

    it("includes multiple categories separated by blank lines", () => {
      const result = buildYAML(categories, {
        "default-space": "custom-space",
        "logging-config": "debug",
      });

      const sections = result.split("\n\n");
      expect(sections).toHaveLength(2);
      expect(sections[0]).toContain("# Networking");
      expect(sections[1]).toContain("# Logging");
    });

    it("includes only changed fields in the output", () => {
      const result = buildYAML(categories, {
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

  describe("buildConfigsConstraintsPayload", () => {
    it("returns empty object when no fields have changed", () => {
      const result = buildConfigsConstraintsPayload({
        "container-networking-method": "local",
        "logging-config": "<root>=INFO",
        arch: "",
      });
      expect(result).toEqual({});
    });

    it("returns only changed field labels and values", () => {
      const result = buildConfigsConstraintsPayload({
        "default-space": "custom-space",
        "container-networking-method": "local",
        "logging-config": "<root>=DEBUG",
        arch: "amd64",
      });

      expect(result).toEqual({
        "default-space": "custom-space",
        "logging-config": "<root>=DEBUG",
        arch: "amd64",
      });
    });

    it("includes changed boolean fields in the payload", () => {
      const result = buildConfigsConstraintsPayload({
        "disable-network-management": true,
      });
      expect(result["disable-network-management"]).toBe(true);
    });

    it("does not include boolean fields that match their default value", () => {
      const result = buildConfigsConstraintsPayload({
        "disable-network-management": false,
      });
      expect(result).not.toHaveProperty("disable-network-management");
    });
  });

  describe("getCategoriesWithVisibleFields", () => {
    it("returns empty array when no fields have changed", () => {
      const result = getCategoriesWithVisibleFields(categories, {});
      expect(result).toHaveLength(0);
    });

    it("returns categories with only changed fields visible", () => {
      const result = getCategoriesWithVisibleFields(categories, {
        "default-space": "modified-space",
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Networking");
      expect(result[0].fields).toHaveLength(1);
      expect(result[0].fields[0].label).toBe("default-space");
    });
  });

  describe("getConfigInitialValues", () => {
    it("returns object with all fields and their default values", () => {
      const result = getConfigInitialValues(categories);
      expect(result).toEqual({
        "default-space": "alpha",
        "container-networking-method": "provider",
        cores: "",
        "logging-config": "",
      });
    });

    it("handles fields with undefined default values", () => {
      const categoriesWithUndefinedDefaults: CategoryDefinition[] = [
        {
          category: "Test",
          fields: [
            {
              label: "test-field",
              defaultValue: undefined,
              description: "Test",
            },
          ],
        },
      ];

      const result = getConfigInitialValues(categoriesWithUndefinedDefaults);
      expect(result["test-field"]).toBe("");
    });

    it("preserves numeric default values without converting to strings", () => {
      const categoriesWithNumericDefaults: CategoryDefinition[] = [
        {
          category: "Test",
          fields: [
            {
              label: "numeric-field",
              defaultValue: 17,
              description: "A numeric field",
              valueType: "number",
            },
          ],
        },
      ];

      const result = getConfigInitialValues(categoriesWithNumericDefaults);
      expect(result["numeric-field"]).toBe(17);
    });

    it("returns empty object when categories are empty", () => {
      const result = getConfigInitialValues([]);
      expect(result).toEqual({});
    });
  });

  describe("filterCategoriesBySearch", () => {
    it("returns all categories when query is empty", () => {
      const result = filterCategoriesBySearch("", categories);
      expect(result.length).toBeGreaterThan(0);
    });

    it("filters fields by label", () => {
      const result = filterCategoriesBySearch("network", categories);

      expect(result.length).toBeGreaterThan(0);
      const allLabels = result.flatMap((cat) =>
        cat.fields.map((field) => field.label.toLowerCase()),
      );

      const hasMatch = allLabels.some((label) => label.includes("network"));
      expect(hasMatch).toBe(true);
    });

    it("filters fields by description", () => {
      const result = filterCategoriesBySearch("method", categories);

      expect(result.length).toBeGreaterThan(0);
      const allDescriptions = result.flatMap((cat) =>
        cat.fields.map((field) => field.description.toLowerCase()),
      );

      const hasMatch = allDescriptions.some((desc) => desc.includes("method"));
      expect(hasMatch).toBe(true);
    });

    it("returns empty array when no fields match", () => {
      const result = filterCategoriesBySearch(
        "non-existent-query123456",
        categories,
      );
      expect(result).toEqual([]);
    });

    it("filters out categories with no matching fields", () => {
      const result = filterCategoriesBySearch("network", categories);

      // All returned categories should have at least one field matching the query
      result.forEach((category) => {
        const hasMatch = category.fields.some(
          (field) =>
            field.label.toLowerCase().includes("network") ||
            field.description.toLowerCase().includes("network"),
        );
        expect(hasMatch).toBe(true);
      });
    });
  });

  describe("validateAndParseYAML", () => {
    it("parses the YAML into valid key-value pairs", () => {
      const { validValues, errors } = validateAndParseYAML(
        "# a comment\n\ndefault-space: custom\nlogging-config: debug\ncores: 4",
        categories,
      );

      expect(validValues).toEqual({
        "default-space": "custom",
        "logging-config": "debug",
        cores: "4",
      });
      expect(errors.invalidKeys).toHaveLength(0);
      expect(errors.invalidValues).toHaveLength(0);
      expect(errors.otherErrors).toHaveLength(0);
    });

    it("normalizes double-quoted empty string to actual empty string", () => {
      const { validValues } = validateAndParseYAML(
        'default-space: ""',
        categories,
      );

      expect(validValues["default-space"]).toBe("");
    });

    it("reports an invalid key for unknown fields", () => {
      const { errors } = validateAndParseYAML("unknown-key: value", categories);

      expect(errors.invalidKeys).toHaveLength(1);
      expect(errors.invalidKeys[0].message).toContain(
        "Unknown key: unknown-key",
      );
      expect(errors.invalidKeys[0].line).toBe(1);
    });

    it("reports other error for lines missing a colon", () => {
      const { errors } = validateAndParseYAML("no-colon-here", categories);

      expect(errors.otherErrors).toHaveLength(1);
      expect(errors.otherErrors[0].message).toContain(
        "Invalid format. Expected <key>: <value>",
      );
    });

    it("reports an invalid value for select fields with disallowed values", () => {
      const selectCategories: CategoryDefinition[] = [
        {
          category: "Test",
          fields: [
            {
              label: "my-select",
              description: "A select field",
              input: {
                type: "select",
                options: [
                  { label: "A", value: "a" },
                  { label: "B", value: "b" },
                ],
              },
            },
          ],
        },
      ];

      const { errors } = validateAndParseYAML(
        "my-select: invalid",
        selectCategories,
      );

      expect(errors.invalidValues).toHaveLength(1);
      expect(errors.invalidValues[0].message).toContain(
        "Expected one of: a, b",
      );
    });

    it("reports an invalid value for numeric fields with non-numeric input", () => {
      const { errors } = validateAndParseYAML(
        "cores: not-a-number",
        categories,
      );

      expect(errors.invalidValues).toHaveLength(1);
      expect(errors.invalidValues[0].message).toContain("Expected a number");
    });

    it("includes catalog default for previously changed fields absent from YAML", () => {
      const { validValues } = validateAndParseYAML(
        "logging-config: debug",
        categories,
        { "default-space": "my-space" },
      );

      // logging-config is in the YAML
      expect(validValues["logging-config"]).toBe("debug");
      // default-space was changed but absent from YAML — should reset to default
      expect(validValues["default-space"]).toBe("alpha");
    });
  });
});
