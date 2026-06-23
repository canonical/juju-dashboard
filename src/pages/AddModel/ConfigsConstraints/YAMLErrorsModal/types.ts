import type { FieldName } from "../types";

export type YAMLValidationError = {
  line: number;
  message: string;
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
