import { changelog, type Ctx } from "@/lib";
import type { PullRequest } from "@/lib/github";
import { setPackageVersion } from "@/lib/package";
import { getNextCutVersion } from "@/lib/release";
import {
  changelogFromLabels,
  severityFits,
  versionFromLabels,
  type Severity,
} from "@/lib/versioning";

const CUT_BRANCH_PREFIX = "cut";
const RELEASE_BRANCH_PREFIX = "release";
function parseCutBranch(
  branch: string,
): { major: number; minor: number } | null {
  const [prefix, severity, ...rest] = branch.split("/");

  if (prefix !== CUT_BRANCH_PREFIX || rest.length > 0) {
    return null;
  }

  const [majorStr, minorStr, ...severityRest] = severity.split(".");
  if (severityRest.length > 0) {
    return null;
  }

  const [major, minor] = [majorStr, minorStr].map(Number);
  if (isNaN(major) || isNaN(minor)) {
    return null;
  }

  return { major, minor };
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
    const labels = ctx.pr.labels.map(({ name }) => name);

    // Action triggered from merged PR, update severity to match.
    const prVersion = versionFromLabels(labels);
    requiredSeverity = prVersion === "major" ? "major" : "minor";

    // Add this PR to the changelog if required.
    if (changelogFromLabels(labels)) {
      changelogItems.push(ctx.pr.title);
    }
  }

  // Find the existing cut PR
  const openPrs = ctx.repo.pullRequests({ state: "open" });
  const matchingPrs: { severity: Severity; pr: PullRequest }[] = [];
  for await (const pr of openPrs) {
    const version = parseCutBranch(pr.head);
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

    const cutBranch = `${CUT_BRANCH_PREFIX}/${major}.${minor}`;
    const releaseBranch = `${RELEASE_BRANCH_PREFIX}/${major}.${minor}`;

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
