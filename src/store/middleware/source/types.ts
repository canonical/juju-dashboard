export type ConfigFieldValue = boolean | number | string | undefined;

export type SelectOption = { label: string; value: string };

export enum ValueType {
  BOOLEAN = "boolean",
  NUMBER = "number",
}

export enum InputType {
  SELECT = "select",
}

export type CategoryDefinitionField = {
  label: string;
  description?: string;
  defaultValue?: ConfigFieldValue;
  input?: { type: InputType.SELECT; options: SelectOption[] };
  valueType?: ValueType;
};

export type CategoryDefinition = {
  // `null` indicates no meaningful grouping (e.g. schema data from the facade).
  category: null | string;
  fields: CategoryDefinitionField[];
};
