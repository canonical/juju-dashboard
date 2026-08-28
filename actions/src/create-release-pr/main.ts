import type { Ctx } from "@/lib";
import { branch } from "@/lib";
import * as changelogMd from "@/lib/changelog-md";
import type { PullRequest } from "@/lib/github";
import { getPackageVersion, setPackageVersion } from "@/lib/package";
import {
  parseVersion,
  serialiseVersion,
  type Version,
} from "@/lib/version";

export type ReleaseResult = {
  releasePrNumber?: number;
  releasePrHead?: string;
  releaseVersion?: null | string;
};

export function bumpPackageVersion(
  version: Version,
  bumpKind: "beta",
  options?: { versionComponent?: "major" | "minor" | "patch" },
): Version;
export function bumpPackageVersion(
  version: Version,
  bumpKind: "candidate",
): Version;
export function bumpPackageVersion(
  version: Version,
  bumpKind: "beta" | "candidate",
  options: { versionComponent?: "major" | "minor" | "patch" } = {},
): Version {
  if (bumpKind === "beta") {
    if (version.preRelease?.identifier === "beta") {
      // Already a beta version, bump the number.
      version.preRelease.number += 1;
    } else {
      // Increment the patch for the next version.
      version[options.versionComponent ?? "patch"] += 1;

      // Set the beta component.
      version.preRelease = {
        identifier: "beta",
        number: 0,
      };
    }
  } else if (bumpKind === "candidate") {
    if (version.preRelease?.identifier !== "beta") {
      throw new Error(
        `Candidate versions can only be created from beta versions, but found: ${serialiseVersion(version)}`,
      );
    }

    // Clear the beta pre-release for the candidate version.
    version.preRelease = undefined;
  }

  return version;
}

type MergedReleasePr = {
  head: { ref: string };
  number: number;
  merged_at: null | string;
};

async function getMergedReleasePr(
  ctx: Ctx,
): Promise<MergedReleasePr | null> {
  const { data: prs } =
    await ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      ...ctx.repo.identifier,
      commit_sha: ctx.context.sha,
    });

  for (const pr of prs) {
    if (
      pr.state === "closed" &&
      pr.merged_at &&
      branch.release.parse(pr.head.ref) !== null
    ) {
      return pr as unknown as MergedReleasePr;
    }
  }

  return null;
}

function isBetaReleasePrMerge(pr: MergedReleasePr): boolean {
  const version = branch.release.parse(pr.head.ref);
  return version !== null && version.preRelease?.identifier === "beta";
}

function computeExpectedVersion(
  currentVersion: Version,
  mergedBeta: boolean,
): null | Version {
  if (currentVersion.preRelease?.identifier === "beta") {
    if (mergedBeta) {
      // A beta release PR just merged: open the follow-up stable PR.
      return bumpPackageVersion(structuredClone(currentVersion), "candidate");
    }
    return bumpPackageVersion(structuredClone(currentVersion), "beta");
  }

  // Stable or placeholder: the only valid path to a stable release goes
  // through a beta first. Always open a beta PR for the next patch version.
  return bumpPackageVersion(structuredClone(currentVersion), "beta");
}

async function closeOpenReleasePrs(ctx: Ctx): Promise<void> {
  const baseBranch = ctx.context.refName;
  const openPrs = ctx.repo.pullRequests({
    state: "open",
    base: baseBranch,
  });

  for await (const pr of openPrs) {
    if (branch.release.parse(pr.head) !== null) {
      ctx.core.info(`Closing stale release PR #${pr.number} (${pr.head}).`);
      await pr.close();
    }
  }
}

export async function run(ctx: Ctx): Promise<ReleaseResult> {
  const branchInfo = branch.shortRelease.parse(ctx.context.refName);
  if (branchInfo === null) {
    ctx.core.info(
      "Not running on a `release/x.y` branch; no release PR action required.",
    );
    return {};
  }

  const headCommit = ctx.context.payload
    .head_commit as unknown as {
    author?: { email?: string };
  };
  if (headCommit?.author?.email === ctx.git.user.email) {
    ctx.core.info(
      "Skipping release PR action because this push was authored by the automation bot.",
    );
    return {};
  }

  const currentVersionStr = await getPackageVersion(ctx);
  const currentVersion = parseVersion(currentVersionStr);
  const mergedReleasePr = await getMergedReleasePr(ctx);
  const mergedBeta = mergedReleasePr
    ? isBetaReleasePrMerge(mergedReleasePr)
    : false;

  const expectedVersion = computeExpectedVersion(
    currentVersion,
    mergedBeta,
  );

  if (expectedVersion === null) {
    ctx.core.info(
      "No release PR action is required for the current state of the branch.",
    );

    // If a stable/candidate PR is open in this state, close it: a stable
    // release is only valid as the immediate follow-up to a beta release PR.
    await closeOpenReleasePrs(ctx);
    return {};
  }

  const expectedVersionStr = serialiseVersion(expectedVersion);
  const releaseBranch = branch.release.serialise(expectedVersion);
  const baseBranch = ctx.context.refName;

  if (
    mergedReleasePr !== null &&
    mergedReleasePr.head.ref === releaseBranch
  ) {
    ctx.core.info(
      `Skipping release PR creation because this push is the merge commit of #${mergedReleasePr.number} (${releaseBranch}).`,
    );
    return {};
  }

  const openPrs = ctx.repo.pullRequests({
    state: "open",
    base: baseBranch,
  });
  const matchingPrs: { pr: PullRequest }[] = [];
  for await (const pr of openPrs) {
    if (branch.release.parse(pr.head) !== null) {
      matchingPrs.push({ pr });
    }
  }

  if (matchingPrs.length > 1) {
    throw new Error(
      `Multiple release PRs were found, when only one can exist: ${matchingPrs.map(({ pr }) => `#${pr.number}`).join(", ")}`,
    );
  }

  let releasePr: null | PullRequest = null;
  if (matchingPrs.length === 1) {
    const [{ pr }] = matchingPrs;
    if (pr.head === releaseBranch) {
      releasePr = pr;
    } else {
      ctx.core.info(
        `Closing stale release PR #${pr.number} (${pr.head}) in favour of ${releaseBranch}.`,
      );
      await pr.close();
    }
  }

  const kind: "beta" | "stable" =
    expectedVersion.preRelease?.identifier === "beta" ? "beta" : "stable";

  await ctx.git.fetch();

  if (!releasePr) {
    await ctx.git.createBranch(releaseBranch, baseBranch);
  } else {
    await ctx.git.moveBranch(releaseBranch, baseBranch);
  }

  await ctx.git.checkout(releaseBranch);
  const branchVersion = await getPackageVersion(ctx);
  const versionChanged = branchVersion !== expectedVersionStr;
  if (versionChanged) {
    await setPackageVersion(ctx, expectedVersionStr);
  }
  const { newContent } = await changelogMd.finalise(
    ctx,
    expectedVersionStr,
    kind,
  );

  // Only commit when something actually changed, so that retrying the same
  // state is a no-op.
  const changed = versionChanged || newContent !== undefined;

  if (changed) {
    await ctx.git.commit(
      `chore(release): prepare ${expectedVersionStr}`,
      ["./package.json", "./CHANGELOG.md"],
    );
  }

  // Always push so a rebased branch is synced even if the commit is a no-op.
  await ctx.git.push({ force: true }, releaseBranch);
  await ctx.git.checkout(baseBranch);

  if (!releasePr) {
    releasePr = await ctx.repo.createPullRequest({
      head: releaseBranch,
      base: baseBranch,
      title: `Release ${expectedVersionStr}`,
      body: `> [!important]\n> Merging this PR will publish ${expectedVersionStr}\n\n---\n\nThe changelog for this release has already been finalised from \`## Unreleased\` on \`${baseBranch}\`.`,
    });
  } else {
    await releasePr.update({
      body: `> [!important]\n> Merging this PR will publish ${expectedVersionStr}\n\n---\n\nThe changelog for this release has already been finalised from \`## Unreleased\` on \`${baseBranch}\`.`,
    });
  }

  return {
    releasePrNumber: releasePr.number,
    releasePrHead: releasePr.head,
    releaseVersion: expectedVersionStr,
  };
}
