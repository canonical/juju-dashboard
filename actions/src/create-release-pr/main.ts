import { changelog, type Ctx } from "@/lib";
import type { PullRequest } from "@/lib/github";
import { getPackageVersion, setPackageVersion } from "@/lib/package";
import { parseVersion, serialiseVersion, type Version } from "@/lib/version";
import { changelogFromLabels, type VersioningInfo } from "@/lib/versioning";
import {
  CUT_BRANCH_PREFIX,
  versioningInfoFromBranch,
} from "@/lib/versioning/branch";

export function bumpPackageVersion(
  versionStr: string,
  bumpKind: "beta",
  options?: { versionComponent?: "major" | "minor" | "patch" },
): string;
export function bumpPackageVersion(
  versionStr: string,
  bumpKind: "candidate",
): string;
export function bumpPackageVersion(
  versionStr: string,
  bumpKind: "beta" | "candidate",
  options: { versionComponent?: "major" | "minor" | "patch" } = {},
) {
  const version = parseVersion(versionStr);

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
    if (version.preRelease.identifier !== "beta") {
      throw new Error(
        `Candidate versions can only be created from beta versions, but found: ${versionStr}`,
      );
    }

    // Clear the beta pre-release for the candidate version.
    version.preRelease = undefined;
  }

  return serialiseVersion(version);
}

const RELEASE_BRANCH_PREFIX = "release";

/**
 * Release branches are in the form `release/{version}`, where `version` is the semver of the
 * release that will be made.
 */
function parseReleaseBranch(branch: string): Version | null {
  const [prefix, versionStr, ...rest] = branch.split("/");

  if (prefix !== RELEASE_BRANCH_PREFIX || rest.length > 0) {
    return null;
  }

  try {
    return parseVersion(versionStr);
  } catch (_e) {
    // Any malformed versions mean that it's not a release branch.
    return null;
  }
}

export async function run(ctx: Ctx) {
  // Extract versioning information for the current branch.
  let versioningInfo: VersioningInfo | null;
  try {
    versioningInfo = versioningInfoFromBranch(ctx.context.refName);
  } catch (_e) {
    versioningInfo = null;
  }

  // Ensure running on `release/x.y` branch.
  if (versioningInfo === null) {
    throw new Error("This action can only be run on a `release/x.y` branch.");
  }

  // Try seed the changelog if running against a PR.
  const changelogItems: string[] = [];
  if (ctx.pr) {
    if (
      ctx.pr.head.startsWith(CUT_BRANCH_PREFIX) ||
      ctx.pr.head.startsWith(RELEASE_BRANCH_PREFIX)
    ) {
      // Triggered from a merged cut or release branch, so re-use the changelog.
      try {
        changelogItems.push(...changelog.parse(ctx.pr.body).items);
      } catch (err) {
        void err;
      }
    } else if (changelogFromLabels(ctx.pr.labels.map(({ name }) => name))) {
      // Triggered from a PR that's indicated it should be included in the changelog, so add it.
      changelogItems.push(ctx.pr.title);
    }
  }

  // Find an existing release PR for this branch.
  const openPrs = ctx.repo.pullRequests({
    state: "open",
    base: ctx.context.refName,
  });
  const matchingPrs: { pr: PullRequest; version: Version }[] = [];
  for await (const pr of openPrs) {
    // Select all PRs based on the branch.
    const version = parseReleaseBranch(pr.head);
    if (version !== null) {
      matchingPrs.push({ pr, version });
    }
  }

  // Create or select the release PR.
  let releasePr: PullRequest;
  let releaseVersion: string;

  if (matchingPrs.length > 1) {
    // Multiple release PRs for this branch, which is invalid.
    throw new Error(
      `Multiple release PRs were found, when only one can exist: ${matchingPrs.map(({ pr: { number } }) => `#${number}`).join(", ")}`,
    );
  } else if (matchingPrs.length === 1) {
    // Single release PR found.
    const { pr, version } = matchingPrs[0];
    releasePr = pr;
    releaseVersion = serialiseVersion(version);
  } else {
    // Fetch the current package version, and bump it as required.
    let packageVersion = await getPackageVersion(ctx);

    const mergedVersion = parseReleaseBranch(ctx.pr.head);
    if (mergedVersion !== null) {
      if (mergedVersion.preRelease?.identifier === "beta") {
        // If this action was triggered by a merged beta branch, create a candidate release.
        packageVersion = bumpPackageVersion(packageVersion, "candidate");
      } else {
        // TODO: Don't create beta release if candidate release was just merged.
      }
    } else if (ctx.pr.head.startsWith("cut/")) {
      // TODO: Fix this once cut-pr is refactored
      packageVersion = bumpPackageVersion(packageVersion, "beta");
    } else {
      // Always assume a beta release is being generated.
      packageVersion = bumpPackageVersion(packageVersion, "beta");
    }

    // Create and checkout the new release branch.
    const baseBranch = ctx.context.refName;
    const branch = `${RELEASE_BRANCH_PREFIX}/${packageVersion}`;
    await ctx.git.createBranch(branch);
    await ctx.git.checkout(branch);

    // Write the version back.
    await setPackageVersion(ctx, packageVersion);

    // Commit the bumped package.
    await ctx.git.commit(`bump package.json version to ${packageVersion}`, [
      "./package.json",
    ]);
    await ctx.git.push(branch);

    // Restore branch back to where it was.
    await ctx.git.checkout(baseBranch);

    const header = `> [!important]
> Merging this PR will publish ${packageVersion}

---
`;
    // Start with an empty changelog, as it will be filled after it's created.
    const body = changelog.generate(header, []);

    // Create new release PR.
    releasePr = await ctx.repo.createPullRequest({
      head: branch,
      base: baseBranch,
      title: `Release ${packageVersion}`,
      body,
    });
    releaseVersion = packageVersion;
  }

  // Optionally update the changelog if the merged PR allows it.
  if (changelogItems.length > 0) {
    // Update the changelog with this merged PR.
    await releasePr.update({
      body: changelogItems.reduce(
        (body, item) => changelog.appendItem(body, item),
        releasePr.body,
      ),
    });
  }

  return {
    releasePrNumber: releasePr.number,
    releasePrHead: releasePr.head,
    releaseVersion,
  };
}
