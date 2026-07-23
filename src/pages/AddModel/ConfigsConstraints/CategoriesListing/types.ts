import type { YAMLErrorsModalState } from "../YAMLErrorsModal/types";
import type { FieldName } from "../types";

export type Props = {
  title: string;
  arrayName: FieldName.CONFIG_FIELDS | FieldName.CONSTRAINT_FIELDS;
  inputMode: FieldName.CONFIG_INPUT_MODE | FieldName.CONSTRAINT_INPUT_MODE;
  yamlKey: FieldName.CONFIG_YAML | FieldName.CONSTRAINT_YAML;
  changedOnlyLabel: string;
  docsLabel: string;
  docsLink: string;
  tooltipMessage: string;
  searchPlaceholder: string;
  yamlPlaceholder: string;
  searchName: string;
  setYAMLErrors: (state: YAMLErrorsModalState) => void;
  yamlErrorLabel: string;
  isLoading?: boolean;
  onSwitchWhileLoading?: () => void;
};
