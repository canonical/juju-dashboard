import { CHANGELOG_END_MARKER, CHANGELOG_START_MARKER } from "./changelog";
import type { Severity } from "./severity";

export async function* asyncIterable<T>(items: T[]) {
  yield* items;
}

export function mockPr({
  number = 123,
  base = "main",
  head,
  labels = [],
  title = "",
  body = "",
}: {
  number?: number;
  base?: string;
  head: string;
  labels?: string[];
  title?: string;
  body?: string;
}) {
  return {
    number,
    base,
    head,
    labels: labels.map((name) => ({ name })),
    title,
    body,
    hasLabel: (label: string) => labels.includes(label),
    changelogEntry: () => `${title} by @user (#${number})`,
  };
}

export function mockCutPr({
  severity = "minor",
  version = "1.0",
  patchVersion,
  headSuffix = null,
  number = 123,
  additionalLabels = [],
  changelog = [],
}: {
  /** Severity of the pull request. */
  severity?: Severity;
  /** Version of the pull request. */
  version?: `${number}.${number}`;
  /** Optional beta version to append to head branch. */
  patchVersion?: number;
  /** Optional suffix for the `head` branch. */
  headSuffix?: string | null;
  /** Pull request number. */
  number?: number;
  /** If `true`, default release labels will be included. */
  defaultLabels?: boolean;
  /** Additional labels to add to the pull request. */
  additionalLabels?: string[];
  changelog?: string[];
} = {}) {
  const labels = [
    "release: cut",
    `release-severity: ${severity}`,
    ...additionalLabels,
  ];

  let headBranchSuffix = "";
  if (patchVersion !== undefined) {
    headBranchSuffix += `.${patchVersion}`;
  }
  if (headSuffix !== null && headSuffix) {
    headBranchSuffix += `-${headSuffix}`;
  }

  return mockPr({
    number,
    base: `release/${version}`,
    head: `cut/${version}${headBranchSuffix}`,
    labels,
    body: [
      "",
      CHANGELOG_START_MARKER,
      ...changelog.map((item) => `- ${item}`),
      CHANGELOG_END_MARKER,
    ].join("\n"),
  });
}
