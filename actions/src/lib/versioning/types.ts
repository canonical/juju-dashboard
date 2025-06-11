/**
 * Summary of version information.
 */
export type VersioningInfo = {
  /** Major/minor version string. */
  version: `${number}.${number}`;
  /** Major component of the version. */
  majorVersion: number;
  /** Minor component of the version. */
  minorVersion: number;
  /** Whether this version is a major release. */
  isMajorRelease: boolean;
};

/**
 * Components of a SemVer version.
 */
export type Version = "major" | "minor" | "patch";

/**
 * Corresponds to the release branch types of the 'stable mainline' approach, where all branches
 * are either a major or minor branch.
 */
export type Severity = "major" | "minor";
