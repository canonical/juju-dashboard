import { type Ctx, branch } from "@/lib";
import { PullRequest } from "@/lib/github";
import type { GithubPullRequest } from "@/lib/github/types";
import { MAJOR_SEVERITY_LABEL } from "@/lib/labels";
import { setPackageVersion } from "@/lib/package";
import { severityFits, type Severity } from "@/lib/severity";
import type { MajorMinorVersion } from "@/lib/version";

export type CutResult = {
  cutPrNumber: number;
  cutBranch: string;
};

/**
 * Determine what the next cut version will be, based on existing `release/x.y` branches in the repo.
 */
export async function getNextCutVersion(
  ctx: Ctx,
  severity: Severity,
): Promise<MajorMinorVersion> {
  let version: MajorMinorVersion | null = null;

  for await (const { name } of ctx.repo.branches()) {
    let branchInfo: MajorMinorVersion | null = null;
    try {
      branchInfo = branch.shortRelease.parse(name);
    } catch {
      branchInfo = null;
    }

    if (branchInfo === null) {
      continue;
    }

    if (
      version === null ||
      branchInfo.major > version.major ||
      (branchInfo.major === version.major && branchInfo.minor > version.minor)
    ) {
      version = {
        major: branchInfo.major,
        minor: branchInfo.minor,
      };
    }
  }

  if (version === null) {
    return { major: 0, minor: 0 };
  }

  if (severity === "major") {
    version.major += 1;
    version.minor = 0;
  }

  if (severity === "minor") {
    version.minor += 1;
  }

  return version;
}

/**
 * Find the merged PR that produced the current push, if any.
 */
async function findMergedPr(ctx: Ctx): Promise<null | PullRequest> {
  const { data: pullRequests } =
    await ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      ...ctx.repo.identifier,
      commit_sha: ctx.context.sha,
    });

  for (const pullRequest of pullRequests) {
    if (pullRequest.merged_at) {
      return new PullRequest(
        ctx.octokit,
        ctx.repo.identifier,
        pullRequest as GithubPullRequest,
      );
    }
  }

  return null;
}

/**
 * Get the major/minor severity for the current push.
 */
async function getSeverity(ctx: Ctx): Promise<Severity> {
  const mergedPr = await findMergedPr(ctx);

  if (mergedPr?.hasLabel(MAJOR_SEVERITY_LABEL)) {
    return "major";
  }

  return "minor";
}

export async function run(ctx: Ctx): Promise<CutResult> {
  if (ctx.context.refName !== ctx.git.mainBranch) {
    throw new Error(
      `This action can only be run on the ${ctx.git.mainBranch} branch`,
    );
  }

  const requiredSeverity = await getSeverity(ctx);

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

  if (matchingPrs.length > 1) {
    throw new Error(
      `Multiple cut PRs were found, when only one can exist: ${matchingPrs.map(({ pr: { number } }) => `#${number}`).join(", ")}`,
    );
  }

  let cutPr: null | PullRequest = null;
  if (matchingPrs.length === 1) {
    const [{ pr, severity }] = matchingPrs;
    if (severityFits(severity, requiredSeverity)) {
      cutPr = pr;
    } else {
      await pr.close();
    }
  }

  if (cutPr === null) {
    const { major, minor } = await getNextCutVersion(ctx, requiredSeverity);

    const cutBranch = branch.cut.serialise(major, minor);
    const releaseBranch = branch.shortRelease.serialise(major, minor);

    await ctx.git.fetch();
    await ctx.git.createBranch(cutBranch);
    await ctx.git.createBranch(releaseBranch);

    await ctx.git.checkout(cutBranch);
    const packageVersion = `${major}.${minor}.x`;
    await setPackageVersion(ctx, packageVersion);

    await ctx.git.commit(
      `chore(release): cut ${major}.${minor} release`,
      ["./package.json", "./CHANGELOG.md"],
    );
    await ctx.git.push(cutBranch, releaseBranch);

    await ctx.git.checkout(ctx.context.refName);

    const header = `> [!important]\n> Merge this PR to create release branch for \`${major}.${minor}\`.\n\n---\n`;
    const body = `${header}\nA new \`release/${major}.${minor}\` branch will be created from \`main\`. Add release notes under \`## Unreleased\` on that branch after the cut.\n`;

    cutPr = await ctx.repo.createPullRequest({
      head: cutBranch,
      base: releaseBranch,
      title: `chore(release): cut ${major}.${minor} release`,
      body,
    });
  }

  return { cutPrNumber: cutPr.number, cutBranch: cutPr.base };
}
