export {
  versionFromLabels,
  changelogFromLabels,
  severityFromLabels,
} from "./labels";
export { versioningInfoFromBranch } from "./branch";
export { severityFits, severityFromVersion } from "./severity";

export type { Severity, Version, VersioningInfo } from "./types";
