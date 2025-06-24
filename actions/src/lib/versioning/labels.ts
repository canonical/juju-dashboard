import type { Severity, Version } from "./types";

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
 * Mapping between a pull request label and the severity.
 */
export const SEVERITY_LABELS: Record<string, Severity> = {
  "release-severity: major": "major",
  "release-severity: minor": "minor",
};

/**
 * Determine the version from a collection of labels. If no version label is detected, `null` will
 * be returned.
 */
export function versionFromLabels(labels: string[]): Version | null {
  let version: Version | null = null;

  for (const label of labels) {
    if (label in PULL_REQUEST_VERSION_LABELS) {
      if (version !== null) {
        throw new Error("multiple version labels detected.");
      }

      version = PULL_REQUEST_VERSION_LABELS[label];

      continue;
    }
  }

  return version;
}

/**
 * Determine if a list of labels includes a label for changelog.
 */
export function changelogFromLabels(labels: string[]): boolean {
  let changelog = false;

  for (const label of labels) {
    if (label === PULL_REQUEST_CHANGELOG_LABEL) {
      changelog = true;

      continue;
    }
  }

  return changelog;
}

/**
 * Determine the severity from a collection of labels. If no severity label is detected, `null`
 * will be returned.
 */
export function severityFromLabels(labels: string[]): Severity | null {
  let severity: Severity | null = null;

  for (const label of labels) {
    if (label in SEVERITY_LABELS) {
      if (severity !== null) {
        throw new Error("multiple severity labels detected.");
      }

      severity = SEVERITY_LABELS[label];

      continue;
    }
  }

  return severity;
}
