import { parseVersion, serialiseVersion, type Version } from "./version";

/**
 * Release branches are in the form `release/x.y` or `release/x.y.z`.
 */
export const RELEASE_BRANCH_PREFIX = "release";

/**
 * Cut branches are in the form `cur/x.y`.
 */
export const CUT_BRANCH_PREFIX = "cut";

/**
 * For the given branch, parse it in the format of `prefix/suffix`. The suffix will be returned.
 * @param prefix - Branch prefix to strip.
 * @param branch - Branch name to parse.
 * @returns Suffix of branch.
 */
function parseBranchPrefix(prefix: string, branch: string) {
  const [branchPrefix, branchSuffix, ...rest] = branch.split("/");

  if (prefix !== branchPrefix) {
    throw new Error(
      `Expected branch prefix ${prefix}, but found ${branchPrefix}`,
    );
  }

  if (rest.length > 0) {
    throw new Error(`Could not parse branch: ${branch}`);
  }

  return branchSuffix;
}

/**
 * Parse a string in the form `major.minor`.
 * @param majorMinor - String to parse.
 * @returns Major and minor component of the string.
 */
function parseMajorMinor(majorMinor: string): { major: number; minor: number } {
  const [majorStr, minorStr, ...suffixRest] = majorMinor.split(".");
  if (suffixRest.length > 0) {
    throw new Error(`Expected 'major.minor' string: ${majorMinor}`);
  }

  const [major, minor] = [majorStr, minorStr].map(Number);
  if (isNaN(major)) {
    throw new Error(`Expected major number: ${majorStr}`);
  }
  if (isNaN(minor)) {
    throw new Error(`Expected minor number: ${minorStr}`);
  }

  return { major, minor };
}

const branch = {
  /** `release/x.y.z` */
  release: {
    /**
     * Parse a release branch in the form `release/x.y.z`, producing the encoded version. If the
     * provided branch isn't a release branch, `null` will be returned.
     * @param branchName - Release branch name.
     * @returns Version encoded in the release branch.
     */
    parse: (branchName: string) => {
      try {
        const suffix = parseBranchPrefix(RELEASE_BRANCH_PREFIX, branchName);
        return parseVersion(suffix);
      } catch (_e) {
        return null;
      }
    },
    /**
     * Serialise a branch name with the provided version.
     * @param version - Version for the release branch.
     * @returns Branch name.
     */
    serialise: (version: Version) => {
      return `${RELEASE_BRANCH_PREFIX}/${serialiseVersion(version)}`;
    },
    /**
     * Test if the provided branch name is a valid release branch.
     * @param branchName - Branch name to test.
     * @returns `true` if the branch name is a valid release branch.
     */
    test: (
      branchName: string,
      { preRelease }: { preRelease?: boolean } = {},
    ) => {
      const version = branch.release.parse(branchName);

      if (version === null) {
        return false;
      }

      if (preRelease) {
        return (version.preRelease !== undefined) === preRelease;
      }

      return true;
    },
  },
  /** `release/x.y` */
  shortRelease: {
    /**
     * Parse a short release branch in the form `release/x.y`, producing the encoded version. If
     * the provided branch isn't a short release branch, `null` will be returned.
     * @param branchName - Short release branch name.
     * @returns Version encoded in the short release branch.
     */
    parse: (branchName: string) => {
      try {
        const suffix = parseBranchPrefix(RELEASE_BRANCH_PREFIX, branchName);
        const { major, minor } = parseMajorMinor(suffix);

        return { major, minor };
      } catch (_e) {
        return null;
      }
    },
    /**
     * Serialise a major and minor version into a short release branch.
     * @param major - Major version for the cut branch.
     * @param minor - Minor version for the cut branch.
     * @returns Branch name.
     */
    serialise: (major: number, minor: number) => {
      return `${RELEASE_BRANCH_PREFIX}/${major}.${minor}`;
    },
    /**
     * Test if the provided branch name is a valid short release branch.
     * @param branchName - Branch name to test.
     * @returns `true` if the branch name is a valid short release branch.
     */
    test: (branchName: string) => {
      return branch.shortRelease.parse(branchName) !== null;
    },
  },
  /** `cut/x.y` */
  cut: {
    /**
     * Parse a cut branch in the form `cut/x.y`, producing the encoded major and minor version. If
     * the provided branch isn't a cut branch, `null` will be returned.
     * @param branchName - Cut branch name.
     * @returns Major and minor version encoded in the cut branch.
     */
    parse: (branchName: string) => {
      try {
        const suffix = parseBranchPrefix(CUT_BRANCH_PREFIX, branchName);
        const { major, minor } = parseMajorMinor(suffix);

        return { major, minor };
      } catch (_e) {
        return null;
      }
    },
    /**
     * Serialise a major and minor version into a cut branch.
     * @param major - Major version for the cut branch.
     * @param minor - Minor version for the cut branch.
     * @returns Branch name.
     */
    serialise: (major: number, minor: number) => {
      return `${CUT_BRANCH_PREFIX}/${major}.${minor}`;
    },
    /**
     * Test if the provided branch name is a valid cut branch.
     * @param branchName - Branch name to test.
     * @returns `true` if the branch name is a valid cut branch.
     */
    test: (branchName: string) => {
      return branch.cut.parse(branchName) !== null;
    },
  },
};

export default branch;
