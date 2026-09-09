export enum Label {
  NOT_FOUND = "No models found",
  DESTROY_MODEL = "Destroy model",
  REVIEW_AND_DESTROY = "Review & destroy",
  TOOLTIP_CONTROLLER_MODEL = "Controller model cannot be destroyed",
  TOOLTIP_NO_ACCESS = "You do not have access to destroy this model",
}

export enum TestId {
  COMPONENT = "ModelsIndex",
}

export const VALID_GROUPINGS = ["status", "cloud", "owner"] as const;
