import type { Severity, Version } from "./types";

/**
 * Check if the `inner` severity fits within the `outer` severity.
 */
export function severityFits(outer: Severity, inner: Severity): boolean {
  return outer === "major" || outer === inner;
}

/**
 * Given a version type, determine the associated release severity.
 */
export function severityFromVersion(version: Version): Severity {
  if (version === "patch" || version === "minor") {
    return "minor";
  }

  return "major";
}
