/**
 * Release information for a release branch.
 */
export type ReleaseInfo = {
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
 * Prefix for release branches.
 */
export const RELEASE_BRANCH_PREFIX = "release";

function splitOnce(
  str: string,
  sep: string,
  allowEmpty: boolean = true,
): [string, string] {
  const parts = str.split(sep);

  if (
    parts.length !== 2 ||
    (!allowEmpty && !parts.every((part) => part.length > 0))
  ) {
    throw new Error(
      `expected split to produce 2 items, but found ${parts.length}`,
    );
  }

  return [parts[0], parts[1]];
}

/**
 * Parse a branch name into its release information. Is the provided branch isn't a release
 * branch, `null` will be returned.
 *
 * A release branch begins with `release/`.
 *
 * @param branchName - Branch name to parse.
 * @returns {ReleaseInfo} Release information parsed from the branch name.
 * @returns {null} Returned if the branch isn't a release branch.
 * @throws {Error} If the branch is a malformed release branch, an error will be thrown.
 */
export function getReleaseBranchInfo(branchName: string): ReleaseInfo | null {
  let prefix: string | undefined, versionStr: string | undefined;

  try {
    [prefix, versionStr] = splitOnce(branchName, "/");
  } catch (_e) {
    prefix = undefined;
    versionStr = undefined;
  }

  if (prefix !== RELEASE_BRANCH_PREFIX) {
    // Unexpected branch format, so mustn't be a release branch.
    return null;
  }

  // Ensure the numbered versions are valid.
  let majorVersion: number | undefined, minorVersion: number | undefined;
  try {
    [majorVersion, minorVersion] = splitOnce(versionStr, ".", false)
      .map((version) => Number(version))
      .filter((version) => !isNaN(version) && Number.isSafeInteger(version));
  } catch (_e) {
    majorVersion = undefined;
    minorVersion = undefined;
  }

  if (majorVersion === undefined || minorVersion === undefined) {
    throw new Error(`malformed release branch name: ${branchName}`);
  }

  return {
    version: `${majorVersion}.${minorVersion}`,
    majorVersion,
    minorVersion,
    isMajorRelease: minorVersion === 0,
  };
}
