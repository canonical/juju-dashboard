export enum Label {
  CANCEL = "Cancel",
  ERROR_FORMAT = "A version is required in the format major.minor.patch",
  ERROR_NO_VERSION = "This version does not exist",
  ERROR_OLDER = "The selected version is older than your current version. Downgrades are not supported.",
  ERROR_SAME = "The selected version is the same as your current version.",
  NOT_FOUND = "Model not found",
  SUBMIT = "Preview upgrade",
}

export enum UpgradeType {
  RECOMMENDED = "recommended",
  MANUAL = "manual",
}

export enum FieldName {
  MANUAL_VERSION = "manualVersion",
  RECOMMENDED_VERSION = "recommendedVersion",
  UPGRADE_TYPE = "upgradeType",
}

export type FormFields = {
  [FieldName.MANUAL_VERSION]: string;
  [FieldName.RECOMMENDED_VERSION]: string;
  [FieldName.UPGRADE_TYPE]: UpgradeType;
};
