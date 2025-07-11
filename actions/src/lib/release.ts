import { labelFromSeverity, RELEASE_CUT_LABEL } from "./versioning/labels";

import { type Ctx, versioning, changelog } from "@/lib";
import type { PullRequest } from "@/lib/github";
import type { Severity, VersioningInfo } from "@/lib/versioning";
import {
  CUT_BRANCH_PREFIX,
  isCutReleaseBranch,
  isReleaseBranch,
  RELEASE_BRANCH_PREFIX,
} from "@/lib/versioning/branch";

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
 * Determine the next release version.
 */
export async function getNextReleaseVersion(
  ctx: Ctx,
  releaseKind: "beta" | "candidate",
): Promise<string> {
  const packageVersion = await ctx
    .execOutput("yq", ["-r", ".version", "./package.json"])
    .then(({ stdout }) => stdout.trim());

  if (releaseKind === "beta") {
    // If already a beta version, just increment the beta tag. If not a beta version, increment the
    // patch version and add a beta tag.
    if (packageVersion.includes("-beta.")) {
      const [baseVersion, betaVersionStr] = packageVersion.split("-beta.");

      // Increment the beta tag
      const betaVersion = Number(betaVersionStr) + 1;

      if (isNaN(betaVersion)) {
        throw new Error(`unable to process beta version: ${packageVersion}`);
      }

      return `${baseVersion}-beta.${betaVersion}`;
    } else {
      // Increment the minor version before adding the beta tag.
      const [major, minor, patch] = packageVersion
        .split(".")
        // If `x` is in the package.json version, incrementing it should result in `0`.
        .map((part) => (part === "x" ? -1 : Number(part)));
      return `${major}.${minor}.${patch + 1}-beta.0`;
    }
  } else if (releaseKind === "candidate") {
    // Candidate versions use the existing beta version, but drop the beta tag.
    if (!packageVersion.includes("-beta.")) {
      throw new Error(
        `candidate versions may only be created from beta versions, but found: ${packageVersion}`,
      );
    }

    return packageVersion.split("-beta.")[0];
  }

  throw new Error(`unknown release kind: ${releaseKind}`);
}

/**
 * Determine the release kind that should be created for the merged branch.
 */
function determineReleaseKind(ctx: Ctx, branch: string): "beta" | "candidate" {
  if (isCutReleaseBranch(branch) && branch.includes("-beta")) {
    // Beta release was just merged, create a candidate release.
    return "candidate";
  }

  // All other merged branches cause a beta release.
  return "beta";
}

/**
 * Create a pull request for the next release cut.
 */
export async function createNextCutPr(
  ctx: Ctx,
  severity: Severity,
  { items }: { items?: string[] } = {},
): Promise<PullRequest> {
  /** Name of the release branch, which will be the target for the PR. */
  let releaseBranch: string;
  /** Name of the cut branch, which the PR will merge into the release branch. */
  let cutBranch: string;
  /** New version for this cut PR, which will be added to `package.json`. */
  let version: string;
  /** Pretty variant of the version, for use in headers/messages. */
  let versionPretty: string;

  // Pre-fetch branches
  await ctx.git.fetch();

  // Determine the next version
  if (ctx.context.refName === ctx.git.mainBranch) {
    // Create a new release branch, and the standard cut branch pointed to it.
    const { major, minor } = await getNextCutVersion(ctx, severity);
    releaseBranch = `${RELEASE_BRANCH_PREFIX}/${major}.${minor}`;
    version = `${major}.${minor}.x`;
    versionPretty = `${major}.${minor}`;
    cutBranch = `${CUT_BRANCH_PREFIX}/${releaseBranch}`;

    // Create the release branch.
    await ctx.git.createBranch(releaseBranch, ctx.repo.defaultBranch);
    await ctx.git.push(releaseBranch);
  } else {
    // Assuming already on `release/x.y` branch
    const releaseKind = determineReleaseKind(ctx, ctx.pr.head);

    version = await getNextReleaseVersion(ctx, releaseKind);
    versionPretty = version;
    cutBranch = `${CUT_BRANCH_PREFIX}/${RELEASE_BRANCH_PREFIX}/${version}`;
    releaseBranch = ctx.context.refName;
  }

  // Create the cut branch.
  await ctx.git.createBranch(cutBranch, ctx.repo.defaultBranch);

  // Checkout cut branch.
  await ctx.git.checkout(cutBranch);

  // Update the version in the package.json.
  await ctx.exec("yq", ["-i", `.version = "${version}"`, "./package.json"]);

  // Commit package.json change.
  await ctx.git.commit(`update package.json version to ${version}`, [
    "./package.json",
  ]);

  // Push all branches.
  await ctx.git.push(cutBranch);

  const header = `> [!important]
  > Merge this PR to open the \`${releaseBranch}\` branch, and prepare for a release.

  ---
  `;

  // Create a pull request from `cutBranch` onto `releaseBranch`.
  const cutPr = await ctx.repo.createPullRequest({
    base: releaseBranch,
    head: cutBranch,

    title: `chore(release): cut ${versionPretty} release`,
    body: changelog.generate(header, items ?? []),
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
  // Determine if the requested severity is valid for this branch.
  if (ctx.context.refName !== ctx.git.mainBranch) {
    const versioningInfo = versioning.versioningInfoFromBranch(
      ctx.context.refName,
    );

    if (!versioningInfo.isMajorRelease && severity === "major") {
      throw new Error("major PR merged into minor release branch");
    }
  }

  // Find all open cut PRs.
  const cutPrs: PullRequest[] = [];
  for await (const pr of ctx.repo.pullRequests({ state: "open" })) {
    // Skip any PRs which don't have the release cut label.
    if (!pr.labels.find(({ name }) => name === RELEASE_CUT_LABEL)) {
      continue;
    }

    if (ctx.context.refName === ctx.git.mainBranch) {
      // Running on `main` branch.
      if (!isCutReleaseBranch(pr.head)) {
        // Pull request doesn't start with `cut/release`, so ignore it.
        continue;
      }

      const releasePortion = pr.head.slice(`${CUT_BRANCH_PREFIX}/`.length);
      if (!isReleaseBranch(releasePortion)) {
        // Pull request isn't in format `cut/release/x.y`, ignore it
        continue;
      }

      // Pull request branch is `cut/release/x.y`. There should only ever be one of these at a
      // time.
    } else if (isReleaseBranch(ctx.context.refName)) {
      // Already running on a `release/*` branch, so ensure pull requests have the correct base.
      if (pr.base !== ctx.context.refName) {
        continue;
      }
    } else {
      // Running on some other branch, abort.
      throw new Error(
        `cannot fetch cut PR of non-main or release branch: ${ctx.context.refName}`,
      );
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
    items: changelog.parse(cutPr.body).items,
  });

  // Close the lower severity PR.
  await cutPr.close();

  return newCutPr;
}
