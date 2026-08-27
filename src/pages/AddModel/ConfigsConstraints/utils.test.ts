import * as yaml from "yaml";

import { YAMLErrorType } from "./YAMLErrorsModal/types";
import { ConfigCategory } from "./configCatalog";
import { ConstraintCategory } from "./constraintsCatalog";
import type { ConfigFieldEntry, ConfigFieldValue } from "./types";
import { InputType, ValueType } from "./types";
import {
  buildConfigsConstraintsPayload,
  buildYAML,
  filterEntriesBySearch,
  getYAMLErrorMessage,
  groupEntriesByCategory,
  isConfigChanged,
  validateAndParseYAML,
} from "./utils";

vi.mock("yaml", async (importActual) => ({
  ...(await importActual<typeof yaml>()),
}));

describe("utils", () => {
  let entries: ConfigFieldEntry[];

  beforeEach(() => {
    entries = [
      {
        label: "default-space",
        category: ConfigCategory.NETWORKING,
        defaultValue: "alpha",
        value: "alpha",
        description: "Default space",
        arrayIndex: 0,
      },
      {
        label: "container-networking-method",
        category: ConfigCategory.NETWORKING,
        defaultValue: "provider",
        value: "provider",
        description: "Networking method",
        arrayIndex: 1,
      },
      {
        label: "cores",
        category: ConstraintCategory.COMPUTE,
        value: "",
        valueType: ValueType.NUMBER,
        arrayIndex: 2,
      },
      {
        label: "logging-config",
        category: ConfigCategory.LOGGING,
        defaultValue: "",
        value: "",
        description: "Logging config",
        arrayIndex: 3,
      },
      {
        label: "vpc-id-force",
        category: ConfigCategory.CLOUD,
        defaultValue: false,
        value: false,
        valueType: ValueType.BOOLEAN,
        arrayIndex: 4,
      },
    ];
  });

  describe("isConfigChanged", () => {
    it.each([
      {
        description: "returns false when value is undefined",
        value: undefined,
        defaultValue: "d",
        expected: false,
      },
      {
        description: "returns false when value matches the default value",
        value: "default-value",
        defaultValue: "default-value",
        expected: false,
      },
      {
        description: "returns true when value differs from the default value",
        value: "different",
        defaultValue: "default-value",
        expected: true,
      },
      {
        description:
          "returns true when value is non-empty and no default is provided",
        value: "some-value",
        defaultValue: undefined,
        expected: true,
      },
      {
        description: "returns true when a numeric value has no default",
        value: 0,
        defaultValue: undefined,
        expected: true,
      },
      {
        description:
          "returns false when a numeric value matches a numeric default",
        value: 0,
        defaultValue: 0,
        expected: false,
      },
      {
        description: "returns false when a boolean value matches the default",
        value: false,
        defaultValue: false,
        expected: false,
      },
      {
        description:
          "returns true when a boolean value differs from the default",
        value: true,
        defaultValue: false,
        expected: true,
      },
    ])("$description", ({ value, defaultValue, expected }) => {
      expect(
        isConfigChanged({
          label: "x",
          category: null,
          value,
          arrayIndex: 0,
          defaultValue,
        }),
      ).toBe(expected);
    });
  });

  describe("groupEntriesByCategory", () => {
    it("groups entries preserving category order", () => {
      const groups = groupEntriesByCategory(entries);
      expect(groups).toHaveLength(4);
      expect(groups[0].category).toBe(ConfigCategory.NETWORKING);
      expect(groups[0].fields).toHaveLength(2);
      expect(groups[1].category).toBe(ConstraintCategory.COMPUTE);
    });
  });

  describe("buildYAML", () => {
    it("returns empty string when no fields have changed", () => {
      expect(buildYAML(entries)).toBe("");
    });

    it("builds YAML with category headers and field values", () => {
      entries[0].value = "custom-space";
      const result = buildYAML(entries);
      expect(result).toContain("# Networking");
      expect(result).toContain("default-space: custom-space");
      expect(result).not.toContain("# Logging");
    });

    it("includes multiple categories separated by blank lines", () => {
      entries[0].value = "custom-space";
      entries[3].value = "debug";

      const sections = buildYAML(entries).split("\n\n");
      expect(sections).toHaveLength(2);
      expect(sections[0]).toContain("# Networking");
      expect(sections[1]).toContain("# Logging");
    });

    it("includes only changed fields in the output", () => {
      entries[0].value = "custom-space";
      entries[3].value = "debug";

      const result = buildYAML(entries);
      expect(result).toContain("default-space: custom-space");
      expect(result).not.toContain("container-networking-method");
      expect(result).toContain("logging-config: debug");
    });
  });

  describe("buildConfigsConstraintsPayload", () => {
    it("returns empty object when no fields have changed", () => {
      expect(buildConfigsConstraintsPayload(entries, [])).toEqual({});
    });

    it("returns only changed field labels and values", () => {
      entries[0].value = "custom-space";
      entries[3].value = "debug";
      expect(buildConfigsConstraintsPayload(entries, [])).toEqual({
        "default-space": "custom-space",
        "logging-config": "debug",
      });
    });

    it("includes changed boolean fields in the payload", () => {
      entries[4].value = true;
      expect(buildConfigsConstraintsPayload(entries, [])["vpc-id-force"]).toBe(
        true,
      );
    });

    it("does not include boolean fields that match their default value", () => {
      expect(buildConfigsConstraintsPayload(entries, [])).not.toHaveProperty(
        "vpc-id-force",
      );
    });

    it("merges config and constraint entries", () => {
      const constraintEntry: ConfigFieldEntry = {
        label: "cores",
        category: ConstraintCategory.COMPUTE,
        value: 4,
        arrayIndex: 0,
        defaultValue: undefined,
        valueType: ValueType.NUMBER,
      };
      expect(
        buildConfigsConstraintsPayload([], [constraintEntry])["cores"],
      ).toBe(4);
    });
  });

  describe("filterEntriesBySearch", () => {
    it("returns all entries when query is empty", () => {
      expect(filterEntriesBySearch("", entries)).toHaveLength(entries.length);
    });

    it("filters entries by label", () => {
      const result = filterEntriesBySearch("network", entries);
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          (entry) =>
            entry.label.toLowerCase().includes("network") ||
            entry.description?.toLowerCase().includes("network"),
        ),
      ).toBe(true);
    });

    it("filters entries by description", () => {
      const result = filterEntriesBySearch("method", entries);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns empty array when no entries match", () => {
      expect(
        filterEntriesBySearch("non-existent-query123456", entries),
      ).toEqual([]);
    });
  });

  describe("validateAndParseYAML", () => {
    const getVal = (
      result: ConfigFieldEntry[],
      label: string,
    ): ConfigFieldValue => result.find((entry) => entry.label === label)?.value;

    it("parses the YAML into valid key-value pairs", () => {
      const { validValues, errors } = validateAndParseYAML(
        "# a comment\n\ndefault-space: custom\nvpc-id-force: true\ncores: 4",
        entries,
      );

      expect(getVal(validValues, "default-space")).toBe("custom");
      expect(getVal(validValues, "vpc-id-force")).toBe(true);
      expect(getVal(validValues, "cores")).toBe(4);
      expect(errors.invalidKeys).toHaveLength(0);
      expect(errors.invalidValues).toHaveLength(0);
      expect(errors.otherErrors).toHaveLength(0);
    });

    it("rejects YAML 1.1 equivalents", () => {
      const { errors } = validateAndParseYAML(
        "vpc-id-force: off\ncores: 1_234",
        entries,
      );
      expect(errors[YAMLErrorType.INVALID_VALUES]).toHaveLength(2);
    });

    it("accepts scientific notation for numeric fields", () => {
      const { validValues, errors } = validateAndParseYAML(
        "cores: 1.23456e13",
        entries,
      );
      expect(errors[YAMLErrorType.INVALID_VALUES]).toHaveLength(0);
      expect(getVal(validValues, "cores")).toBe(1.23456e13);
    });

    it("reports an invalid key for unknown fields", () => {
      const { errors } = validateAndParseYAML("unknown-key: value", entries);
      expect(errors.invalidKeys).toHaveLength(1);
      expect(errors.invalidKeys[0].message).toContain(
        "Unknown key: unknown-key",
      );
      expect(errors.invalidKeys[0].line).toBe(1);
    });

    it("reports other error for malformed YAML syntax", () => {
      const { errors } = validateAndParseYAML(
        "key: value\n  bad-indent: oops",
        entries,
      );
      expect(errors.otherErrors.length).toBeGreaterThanOrEqual(1);
      expect(errors.otherErrors[0].line).toBeGreaterThan(0);
    });

    it("reports an invalid value for select fields with disallowed values", () => {
      const selectEntries: ConfigFieldEntry[] = [
        {
          label: "my-select",
          description: "A select field",
          category: "Test",
          arrayIndex: 0,
          value: "",
          input: {
            type: InputType.SELECT,
            options: [
              { label: "A", value: "a" },
              { label: "B", value: "b" },
            ],
          },
        },
      ];
      const { errors } = validateAndParseYAML(
        "my-select: invalid",
        selectEntries,
      );
      expect(errors.invalidValues).toHaveLength(1);
      expect(errors.invalidValues[0].message).toContain(
        "Expected one of: a, b",
      );
    });

    it("reports an invalid value for numeric fields with non-numeric input", () => {
      const { errors } = validateAndParseYAML("cores: not-a-number", entries);
      expect(errors.invalidValues).toHaveLength(1);
      expect(errors.invalidValues[0].message).toContain("Expected a number");
    });

    it("parses boolean YAML scalars correctly", () => {
      const boolEntries: ConfigFieldEntry[] = [
        {
          label: "my-bool",
          description: "A boolean field",
          defaultValue: false,
          category: "Test",
          arrayIndex: 0,
          value: false,
          valueType: ValueType.BOOLEAN,
          input: {
            type: InputType.SELECT,
            options: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
          },
        },
      ];
      const { validValues, errors } = validateAndParseYAML(
        "my-bool: true",
        boolEntries,
      );
      expect(getVal(validValues, "my-bool")).toBe(true);
      expect(errors.invalidValues).toHaveLength(0);
    });

    it("reports an invalid value for boolean fields with non-boolean input", () => {
      const boolEntries: ConfigFieldEntry[] = [
        {
          label: "my-bool",
          description: "A boolean field",
          defaultValue: false,
          category: "Test",
          arrayIndex: 0,
          value: false,
          valueType: ValueType.BOOLEAN,
          input: {
            type: InputType.SELECT,
            options: [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ],
          },
        },
      ];
      const { errors } = validateAndParseYAML(
        'my-bool: "not-a-bool"',
        boolEntries,
      );
      expect(errors.invalidValues).toHaveLength(1);
      expect(errors.invalidValues[0].message).toContain(
        "Expected one of: true, false",
      );
    });

    it("reports an invalid value when a field has a sequence or mapping value", () => {
      const { errors } = validateAndParseYAML(
        "default-space:\n  - item1\n  - item2",
        entries,
      );
      expect(errors.invalidValues).toHaveLength(1);
      expect(errors.invalidValues[0].message).toContain(
        "Invalid value for default-space",
      );
      expect(errors.invalidValues[0].line).toBe(1);
    });

    it("reports an other error when the top-level YAML is not a key-value map", () => {
      const { errors } = validateAndParseYAML("- item1\n- item2", entries);
      expect(errors.otherErrors.length).toBeGreaterThanOrEqual(1);
      expect(
        errors.otherErrors.some((error) =>
          error.message.includes("Expected a top-level key-value map"),
        ),
      ).toBe(true);
    });

    it("reports an other error when a map item is not a Pair node", () => {
      // Inject a non-Pair item (a plain Scalar) directly into a YAMLMap.
      const map = new yaml.YAMLMap();
      map.items.push(new yaml.Scalar("not-a-pair") as unknown as yaml.Pair);
      const parseDocumentSpy = vi
        .spyOn(yaml, "parseDocument")
        .mockReturnValue({ errors: [], contents: map } as unknown as ReturnType<
          typeof yaml.parseDocument
        >);
      const { errors } = validateAndParseYAML("key: value", entries);

      expect(parseDocumentSpy).toHaveBeenCalledTimes(1);
      expect(
        errors.otherErrors.some((error) =>
          error.message.includes("Unexpected non-key-value item in map"),
        ),
      ).toBe(true);
      parseDocumentSpy.mockRestore();
    });

    it("reports an other error when a map key is not a scalar", () => {
      // Inject a Pair whose key is a YAMLSeq (non-scalar).
      const map = new yaml.YAMLMap();
      const seq = new yaml.YAMLSeq();
      seq.add(new yaml.Scalar("nested"));
      map.items.push(new yaml.Pair(seq, new yaml.Scalar("value")));
      const parseDocumentSpy = vi
        .spyOn(yaml, "parseDocument")
        .mockReturnValue({ errors: [], contents: map } as unknown as ReturnType<
          typeof yaml.parseDocument
        >);
      const { errors } = validateAndParseYAML("key: value", entries);
      parseDocumentSpy.mockRestore();

      expect(
        errors.otherErrors.some((error) =>
          error.message.includes("Unexpected non-scalar key"),
        ),
      ).toBe(true);
    });

    it("resets previously-changed fields absent from YAML to their default", () => {
      entries[0].value = "my-space";
      const { validValues } = validateAndParseYAML(
        "logging-config: debug",
        entries,
      );

      // logging-config is in the YAML
      expect(getVal(validValues, "logging-config")).toBe("debug");
      // default-space was changed but absent — reset to catalog default.
      expect(getVal(validValues, "default-space")).toBe("alpha");
    });
  });

  describe("getYAMLErrorMessage", () => {
    it("returns an invalid format message with the given context", () => {
      expect(
        getYAMLErrorMessage(YAMLErrorType.OTHERS, { context: "Error context" }),
      ).toBe("Invalid format. Error context");
    });

    it("returns an unknown key message with the given key", () => {
      expect(
        getYAMLErrorMessage(YAMLErrorType.UNKNOWN_KEYS, { key: "bad-key" }),
      ).toBe("Unknown key: bad-key");
    });

    it("returns an invalid value message", () => {
      expect(
        getYAMLErrorMessage(YAMLErrorType.INVALID_VALUES, { key: "my-field" }),
      ).toBe("Invalid value for my-field");
    });

    it("returns an invalid value message with expected value", () => {
      expect(
        getYAMLErrorMessage(YAMLErrorType.INVALID_VALUES, {
          key: "my-field",
          expectedValue: "a number",
        }),
      ).toBe("Invalid value for my-field. Expected a number");
    });
  });
});
