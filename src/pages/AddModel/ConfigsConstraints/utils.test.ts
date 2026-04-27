import type { CategoryDefinition } from "./configCatalog";
import {
  buildChangedConfigPayload,
  buildConfigYAML,
  filterConfigsBySearch,
  getChangedFields,
  getCategoriesWithVisibleConfigs,
  getConfigInitialValues,
  isConfigChanged,
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

  describe("buildChangedConfigPayload", () => {
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
        ],
      },
    ];

    it("returns empty object when no fields have changed", () => {
      const result = buildChangedConfigPayload(categories, {
        "default-space": "alpha",
        "container-networking-method": "provider",
        "logging-config": "",
      });

      expect(result).toEqual({});
    });

    it("returns only changed field labels and values", () => {
      const result = buildChangedConfigPayload(categories, {
        "default-space": "custom-space",
        "container-networking-method": "provider",
        "logging-config": "debug",
      });

      expect(result).toEqual({
        "default-space": "custom-space",
        "logging-config": "debug",
      });
    });
  });

  describe("getCategoriesWithVisibleConfigs", () => {
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
        ],
      },
    ];

    it("returns empty array when no fields have changed", () => {
      const result = getCategoriesWithVisibleConfigs(categories, {});

      expect(result).toHaveLength(0);
    });

    it("returns categories with only changed fields visible", () => {
      const result = getCategoriesWithVisibleConfigs(categories, {
        "default-space": "modified-space",
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("Networking");
      expect(result[0].fields).toHaveLength(1);
      expect(result[0].fields[0].label).toBe("default-space");
    });
  });

  describe("getConfigInitialValues", () => {
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
        ],
      },
    ];

    it("returns object with all fields and their default values", () => {
      const result = getConfigInitialValues(categories);

      expect(result).toEqual({
        "default-space": "alpha",
        "container-networking-method": "provider",
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

    it("returns empty object when categories are empty", () => {
      const result = getConfigInitialValues([]);

      expect(result).toEqual({});
    });
  });

  describe("filterConfigsBySearch", () => {
    it("returns all categories when query is empty", () => {
      const result = filterConfigsBySearch("");

      expect(result.length).toBeGreaterThan(0);
    });

    it("filters fields by label", () => {
      const result = filterConfigsBySearch("proxy");

      expect(result.length).toBeGreaterThan(0);
      const allLabels = result.flatMap((cat) =>
        cat.fields.map((field) => field.label.toLowerCase()),
      );

      const hasMatch = allLabels.some((label) => label.includes("proxy"));
      expect(hasMatch).toBe(true);
    });

    it("filters fields by description", () => {
      const result = filterConfigsBySearch("method");

      expect(result.length).toBeGreaterThan(0);
      const allDescriptions = result.flatMap((cat) =>
        cat.fields.map((field) => field.description.toLowerCase()),
      );

      const hasMatch = allDescriptions.some((desc) => desc.includes("method"));
      expect(hasMatch).toBe(true);
    });

    it("returns empty array when no fields match", () => {
      const result = filterConfigsBySearch("non-existent-query123456");

      expect(result).toEqual([]);
    });

    it("filters out categories with no matching fields", () => {
      const result = filterConfigsBySearch("proxy");

      // All returned categories should have at least one field matching the query
      result.forEach((category) => {
        const hasMatch = category.fields.some(
          (field) =>
            field.label.toLowerCase().includes("proxy") ||
            field.description.toLowerCase().includes("proxy"),
        );
        expect(hasMatch).toBe(true);
      });
    });
  });
});
