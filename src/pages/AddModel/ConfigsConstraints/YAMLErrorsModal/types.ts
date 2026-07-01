import { FieldName } from "../types";

export type YAMLValidationError = {
  message: string;
  line?: number;
};

export type YAMLErrors = {
  invalidKeys: YAMLValidationError[];
  invalidValues: YAMLValidationError[];
  otherErrors: YAMLValidationError[];
};

export type YAMLErrorsModalState = {
  errors: YAMLErrors;
  inputMode: FieldName.CONFIG_INPUT_MODE | FieldName.CONSTRAINT_INPUT_MODE;
  yamlKey: FieldName.CONFIG_YAML | FieldName.CONSTRAINT_YAML;
};

export type YAMLErrorsModalProps = {
  errors: YAMLErrors;
  yamlKey: FieldName.CONFIG_YAML | FieldName.CONSTRAINT_YAML;
  onConfirm: () => void;
  onClose: () => void;
};

export const ENTITY_LABELS: Record<
  FieldName.CONFIG_YAML | FieldName.CONSTRAINT_YAML,
  string
> = {
  [FieldName.CONFIG_YAML]: "configuration",
  [FieldName.CONSTRAINT_YAML]: "constraint",
};
