import type { VersioningInfo } from "./types";

import { util } from "@/lib";

/**
 * Prefix for release branches.
 */
export const RELEASE_BRANCH_PREFIX = "release";

/**
 * Parse a branch name into its version information. If the provided branch isn't a release
 * branch, `null` will be returned.
 *
 * A release branch begins with `release/`.
 *
 * @param branch - Branch name to parse.
 * @returns {ReleaseInfo} Release information parsed from the branch name.
 * @returns {null} Returned if the branch isn't a release branch.
 * @throws {Error} If the branch is a malformed release branch, an error will be thrown.
 */
export function versioningInfoFromBranch(
  branch: string,
): VersioningInfo | null {
  let prefix: string | undefined;
  let versionStr: string | undefined;

  try {
    [prefix, versionStr] = util.splitOnce(branch, "/");
  } catch (_e) {
    prefix = undefined;
    versionStr = undefined;
  }

  if (prefix !== RELEASE_BRANCH_PREFIX) {
    // Unexpected branch format, so mustn't be a release branch.
    return null;
  }

  // Ensure the numbered versions are valid.
  let majorVersion: number | undefined;
  let minorVersion: number | undefined;
  try {
    [majorVersion, minorVersion] = util
      .splitOnce(versionStr, ".", false)
      .map((version) => Number(version))
      .filter((version) => !isNaN(version) && Number.isSafeInteger(version));
  } catch (_e) {
    majorVersion = undefined;
    minorVersion = undefined;
  }

  if (majorVersion === undefined || minorVersion === undefined) {
    throw new Error(`malformed release branch name: ${branch}`);
  }

  return {
    version: `${majorVersion}.${minorVersion}`,
    majorVersion,
    minorVersion,
    isMajorRelease: minorVersion === 0,
  };
}
