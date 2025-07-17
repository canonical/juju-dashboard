/**
 * Corresponds to the release branch types of the 'stable mainline' approach, where all branches
 * are either a major or minor branch.
 */
export type Severity = "major" | "minor";

/**
 * Components of a SemVer version.
 */
export type Version = "major" | "minor" | "patch";

export function isSeverity(severity: string): severity is Severity {
  return ["minor", "major"].includes(severity);
}

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
