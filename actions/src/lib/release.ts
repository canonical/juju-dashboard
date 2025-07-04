import { labelFromSeverity, RELEASE_CUT_LABEL } from "./versioning/labels";

import { type Ctx, versioning, changelog } from "@/lib";
import type { PullRequest } from "@/lib/github";
import type { Severity, VersioningInfo } from "@/lib/versioning";

/**
 * Determine what the next release cut version will be.
 */
export async function getNextCutVersion(
  ctx: Ctx,
  severity: Severity,
): Promise<{ major: number; minor: number }> {
  let version: { major: number; minor: number } | null = null;

  // Search through each branch, and try find a release branch.
  for await (const { name } of ctx.repo.branches()) {
    // Parse out release information from branches formatted as `release/X.Y`.
    let branchInfo: VersioningInfo | null;
    try {
      branchInfo = versioning.versioningInfoFromBranch(name);
    } catch (_err) {
      branchInfo = null;
    }

    // Invalid release branch, so continue.
    if (branchInfo === null) {
      continue;
    }

    if (
      version === null ||
      // This branch is a higher major version.
      branchInfo.majorVersion > version.major ||
      // This branch is the same major version, but higher minor version.
      (branchInfo.majorVersion === version.major &&
        branchInfo.minorVersion > version.minor)
    ) {
      // Capture this branch version
      version = {
        major: branchInfo.majorVersion,
        minor: branchInfo.minorVersion,
      };
    }
  }

  // No previous release branch was found, so default to `0.0`.
  if (version === null) {
    return { major: 0, minor: 0 };
  }

  // Increment major version for a major release.
  if (severity === "major") {
    version.major += 1;
    version.minor = 0;
  }

  // Increment minor version for a minor release.
  if (severity === "minor") {
    version.minor += 1;
  }

  return version;
}

/**
 * Create a pull request for the next release cut.
 */
export async function createNextCutPr(
  ctx: Ctx,
  severity: Severity,
  { items }: { items?: string[] } = {},
): Promise<PullRequest> {
  // Determine the next version
  const version = await getNextCutVersion(ctx, severity);
  const releaseBranch = `release/${version.major}.${version.minor}`;
  const cutBranch = `cut/${releaseBranch}`;

  // Create branches starting at the default branch.
  await Promise.all(
    [releaseBranch, cutBranch].map(async (branchName) => {
      await ctx.git.createBranch(branchName, ctx.repo.defaultBranch);
    }),
  );

  // Checkout cut branch.
  await ctx.git.checkout(cutBranch);

  // Update the version in the package.json.
  const packageVersion = `${version.major}.${version.minor}.0`;
  await ctx.exec("yq", [
    "-i",
    `.version = "${packageVersion}"`,
    "./package.json",
  ]);

  // Commit package.json change.
  await ctx.git.commit(`update package.json version to ${packageVersion}`, [
    "./package.json",
  ]);

  // Push all branches.
  await ctx.git.push(releaseBranch, cutBranch);

  // Create a pull request from `cutBranch` onto `releaseBranch`.
  const cutPr = await ctx.repo.createPullRequest({
    base: releaseBranch,
    head: cutBranch,

    title: `chore(release): cut ${version.major}.${version.minor} release`,
    body: changelog.generate(releaseBranch, items ?? []),
  });

  // Add labels to the PR.
  await cutPr.setLabels([RELEASE_CUT_LABEL, labelFromSeverity(severity)]);

  return cutPr;
}

/**
 * Find or create a release cut PR for the specified severity. If one a suitable PR doesn't exist,
 * it will be created. If a cut PR already exists but doesn't fit the requested severity, it will
 * be 'upgraded' to the correct severity.
 */
export async function getCutPr(
  ctx: Ctx,
  severity: "major" | "minor",
): Promise<PullRequest> {
  // Find all open cut PRs.
  const cutPrs: PullRequest[] = [];
  for await (const pr of ctx.repo.pullRequests({ state: "open" })) {
    // Skip any PRs which don't have the release cut label.
    if (!pr.labels.find(({ name }) => name === RELEASE_CUT_LABEL)) {
      continue;
    }

    cutPrs.push(pr);
  }

  if (cutPrs.length > 1) {
    throw new Error(
      `Multiple open cut PRs were found, only one can exist: ${cutPrs.map(({ number }) => `#${number}`).join(", ")}`,
    );
  }

  // If there are no open cut PRs, can create one as needed.
  if (cutPrs.length === 0) {
    return await createNextCutPr(ctx, severity);
  }

  // Find the severity of the PR.
  const cutPr = cutPrs[0];
  const prSeverity = versioning.severityFromLabels(
    cutPr.labels.map(({ name }) => name),
  );

  if (prSeverity === null) {
    throw new Error(
      `release cut PR #${cutPr.number} doesn't have an associated release severity tag.`,
    );
  }

  // If the requested severity fits inside the existing cut PR, just re-use it.
  if (versioning.severityFits(prSeverity, severity)) {
    return cutPr;
  }

  // Create the higher severity PR
  const newCutPr = await createNextCutPr(ctx, severity, {
    items: changelog.parse(cutPr.body),
  });

  // Close the lower severity PR.
  await cutPr.close();

  return newCutPr;
}
