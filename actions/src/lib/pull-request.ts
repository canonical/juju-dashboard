import type { github } from "@/lib";

type Version = "major" | "minor" | "patch";

/**
 * Versioning information associated with a pull request.
 */
export type PullRequestVersioningInfo = {
  /** Detected version for the pull request. */
  version: Version;
  /** Whether the pull request should be included in the changelog. */
  changelog: boolean;
};

/**
 * Mapping between a pull request label and the version.
 */
export const PULL_REQUEST_VERSION_LABELS: Record<string, Version> = {
  "version: major": "major",
  "version: minor": "minor",
  "version: patch": "patch",
};

/**
 * Pull request label that indicates the pull request is to be included in the changelog.
 */
export const PULL_REQUEST_CHANGELOG_LABEL = "changelog";

/**
 * Using the provided pull request, determine the versioning information. If this pull request
 * isn't suitable for versioning, then `null` will be returned.
 *
 * @param pullRequest - Pull request to process.
 * @returns {PullRequestVersioningInfo} Versioning information for this pull request.
 * @returns {null} This pull request isn't suitable for versioning.
 */
export function getPullRequestInfo(
  pullRequest: github.PullRequest,
): PullRequestVersioningInfo | null {
  let version: PullRequestVersioningInfo["version"] | null = null;
  let changelog = false;

  for (const prLabel of pullRequest.labels) {
    if (prLabel.name in PULL_REQUEST_VERSION_LABELS) {
      if (version !== null) {
        throw new Error("pull request has multiple version labels.");
      }

      version = PULL_REQUEST_VERSION_LABELS[prLabel.name];

      continue;
    }

    if (prLabel.name === PULL_REQUEST_CHANGELOG_LABEL) {
      changelog = true;

      continue;
    }
  }

  if (version === null) {
    // No version added to this PR, so it can be ignored.
    return null;
  }

  return { version, changelog };
}
