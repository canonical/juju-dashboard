import { FieldName } from "../types";

export type YAMLValidationError = {
  message: string;
  line?: number;
};

export enum YAMLErrorType {
  UNKNOWN_KEYS = "invalidKeys",
  INVALID_VALUES = "invalidValues",
  OTHERS = "otherErrors",
}

export type YAMLErrors = {
  [YAMLErrorType.UNKNOWN_KEYS]: YAMLValidationError[];
  [YAMLErrorType.INVALID_VALUES]: YAMLValidationError[];
  [YAMLErrorType.OTHERS]: YAMLValidationError[];
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
