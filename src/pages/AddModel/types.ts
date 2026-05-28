import type { AccessLevel } from "types";

import type { FormFields } from "./ConfigsConstraints/types";

export enum TestId {
  COMPONENT = "add-model",
  ADD_MODEL_CONTENT = "add-model-content",
  ADD_MODEL_FORM = "add-model-form",
}

export enum StepType {
  MANDATORY_DETAILS = "mandatory-details",
  CONFIGURATION_CONSTRAINTS = "configuration-constraints",
  ACCESS_MANAGEMENT = "access-management",
}

export type AddModelFormState = {
  modelName: string;
  cloud: string;
  region: string;
  credential: string;
  shareModelWith?: Record<string, AccessLevel>;
} & FormFields &
  Record<string, string>;

export enum Label {
  TITLE = "Add model",
  CANCEL_BUTTON = "Cancel",
  NEXT_BUTTON = "Next",
  BACK_BUTTON = "Back",
  CREATE_BUTTON = "Add model",
  INCORRECT_MODEL_NAME_ERROR = "Incorrect model name format.",
}
