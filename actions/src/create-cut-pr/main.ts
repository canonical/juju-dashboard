import { branch, changelog, type Ctx } from "@/lib";
import type { PullRequest } from "@/lib/github";
import { CHANGELOG_LABEL, MAJOR_SEVERITY_LABEL } from "@/lib/labels";
import { setPackageVersion } from "@/lib/package";
import { severityFits, type Severity } from "@/lib/severity";

/**
 * Determine what the next cut version will be, based existing release/x.y` branches in the repo.
 */
export async function getNextCutVersion(
  ctx: Ctx,
  severity: Severity,
): Promise<{ major: number; minor: number }> {
  let version: { major: number; minor: number } | null = null;

  // Search through each branch, and try find a release branch.
  for await (const { name } of ctx.repo.branches()) {
    // Parse out release information from branches formatted as `release/x.y`.
    let branchInfo: { major: number; minor: number } | null;
    try {
      branchInfo = branch.shortRelease.parse(name);
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
      branchInfo.major > version.major ||
      // This branch is the same major version, but higher minor version.
      (branchInfo.major === version.major && branchInfo.minor > version.minor)
    ) {
      // Capture this branch version
      version = {
        major: branchInfo.major,
        minor: branchInfo.minor,
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

export async function run(ctx: Ctx) {
  // Ensure running on `main` branch
  if (ctx.context.refName !== ctx.git.mainBranch) {
    throw new Error(
      `This action can only be run on the ${ctx.git.mainBranch} branch`,
    );
  }

  // Determine the severity (major/minor) of the merged PR (default to minor if pushed commit)
  let requiredSeverity: Severity = "minor";

  let cutPr: PullRequest;
  const changelogItems: string[] = [];

  if (ctx.pr) {
    // Action triggered from merged PR, update severity to match.
    if (ctx.pr.hasLabel(MAJOR_SEVERITY_LABEL)) {
      requiredSeverity = "major";
    }

    // Add this PR to the changelog if required.
    if (ctx.pr.hasLabel(CHANGELOG_LABEL)) {
      changelogItems.push(ctx.pr.title);
    }
  }

  // Find the existing cut PR
  const openPrs = ctx.repo.pullRequests({ state: "open" });
  const matchingPrs: { severity: Severity; pr: PullRequest }[] = [];
  for await (const pr of openPrs) {
    const version = branch.cut.parse(pr.head);
    if (version === null) {
      continue;
    }

    const severity = version.minor === 0 ? "major" : "minor";
    matchingPrs.push({ pr, severity });
  }

  // If multiple cut PRs found, abort
  if (matchingPrs.length > 1) {
    throw new Error(
      `Multiple cut PRs were found, when only one can exist: ${matchingPrs.map(({ pr: { number } }) => `#${number}`).join(", ")}`,
    );
  } else if (matchingPrs.length === 1) {
    // Single cut PR found.
    const { pr, severity } = matchingPrs[0];

    if (severityFits(severity, requiredSeverity)) {
      // Can re-use the existing PR.
      cutPr = pr;
    } else {
      // Copy the changelog from the PR, so it can be re-used.
      changelogItems.unshift(...changelog.parse(pr.body).items);

      // Must close the existing PR to create a new one.
      await pr.close();
    }
  }

  if (cutPr === undefined) {
    // Create a new cut PR
    const { major, minor } = await getNextCutVersion(ctx, requiredSeverity);

    const cutBranch = branch.cut.serialise(major, minor);
    const releaseBranch = branch.shortRelease.serialise(major, minor);

    // Create the cut and release branches
    await ctx.git.createBranch(cutBranch);
    await ctx.git.createBranch(releaseBranch);

    // Checkout cut branch so package.json can be modified
    await ctx.git.checkout(cutBranch);
    const packageVersion = `${major}.${minor}.x`;
    await setPackageVersion(ctx, packageVersion);
    await ctx.git.commit(`update package.json version to ${packageVersion}`, [
      "./package.json",
    ]);
    await ctx.git.push(cutBranch, releaseBranch);

    // Return to original branch
    await ctx.git.checkout(ctx.context.refName);

    const header = `> [!important]
> Merge this PR to create release branch for \`${major}.${minor}\`.

---
`;
    // Start with an empty changelog, as it will be filled after it's created.
    const body = changelog.generate(header, []);
    // Create the PR
    cutPr = await ctx.repo.createPullRequest({
      head: cutBranch,
      base: releaseBranch,
      title: `chore(release): cut ${major}.${minor} release`,
      body,
    });
  }

  if (changelogItems.length > 0) {
    // Update the changelog of the cut PR.
    await cutPr.update({
      body: changelogItems.reduce(
        (body, item) => changelog.appendItem(body, item),
        cutPr.body,
      ),
    });
  }

  return { cutPrNumber: cutPr.number, cutBranch: cutPr.base };
}
