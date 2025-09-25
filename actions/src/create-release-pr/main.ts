import { branch, changelog, type Ctx } from "@/lib";
import type { PullRequest } from "@/lib/github";
import { CHANGELOG_LABEL } from "@/lib/labels";
import { getPackageVersion, setPackageVersion } from "@/lib/package";
import type { MajorMinorVersion } from "@/lib/version";
import { parseVersion, serialiseVersion, type Version } from "@/lib/version";

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

export async function run(ctx: Ctx): Promise<ReleaseResult> {
  // Extract versioning information for the current branch.
  let versioningInfo: MajorMinorVersion | null = null;
  try {
    versioningInfo = branch.shortRelease.parse(ctx.context.refName);
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
      (branch.cut.test(ctx.pr.head) ||
        branch.release.test(ctx.pr.head, { preRelease: true })) &&
      ctx.pr.body !== null &&
      ctx.pr.body
    ) {
      // Triggered from a merged cut branch, so re-use the changelog.
      try {
        changelogItems.push(...changelog.parse(ctx.pr.body).items);
      } catch (err) {
        void err;
      }
    } else if (branch.release.test(ctx.pr.head, { preRelease: false })) {
      // Running on a merged release branch, no need to continue action.
      ctx.core.info(
        `Action triggered on merged release PR (#${ctx.pr.number}), exiting.`,
      );
      return {};
    } else if (ctx.pr.hasLabel(CHANGELOG_LABEL)) {
      // Triggered from a PR that's indicated it should be included in the changelog, so add it.
      changelogItems.push(ctx.pr.changelogEntry());
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
    const version = branch.release.parse(pr.head);
    if (version !== null) {
      matchingPrs.push({ pr, version });
    }
  }

  // Create or select the release PR.
  let releasePr: null | PullRequest = null;
  let releaseVersion: null | string = null;

  if (matchingPrs.length > 1) {
    // Multiple release PRs for this branch, which is invalid.
    throw new Error(
      `Multiple release PRs were found, when only one can exist: ${matchingPrs.map(({ pr: { number } }) => `#${number}`).join(", ")}`,
    );
  } else if (matchingPrs.length === 1) {
    // Single release PR found.
    const [{ pr, version }] = matchingPrs;

    if (!version.preRelease) {
      // Save the existing changelog.
      // WARN: This means that the beta PR will contain the changelog for ALL previous beta PRs.
      changelogItems.unshift(...changelog.parse(pr.body ?? "").items);

      // This was a candidate release PR, however new changes have been pushed so it's now outdated.
      await pr.close();
    } else {
      releasePr = pr;
      releaseVersion = serialiseVersion(version);
    }
  }

  if (!releasePr) {
    // Fetch the current package version, and bump it as required.
    let packageVersion = parseVersion(await getPackageVersion(ctx));

    // Always assume a beta release is being generated.
    packageVersion = bumpPackageVersion(packageVersion, "beta");

    if (ctx.pr) {
      const mergedVersion = branch.release.parse(ctx.pr.head);
      if (mergedVersion !== null) {
        if (mergedVersion.preRelease?.identifier === "beta") {
          // If this action was triggered by a merged beta branch, create a candidate release.
          packageVersion = bumpPackageVersion(packageVersion, "candidate");
        }
      }
    }

    // Create and checkout the new release branch.
    const baseBranch = ctx.context.refName;
    const releaseBranch = branch.release.serialise(packageVersion);
    await ctx.git.fetch();
    await ctx.git.createBranch(releaseBranch, baseBranch);
    await ctx.git.checkout(releaseBranch);

    // Write the version back.
    const packageVersionStr = serialiseVersion(packageVersion);
    await setPackageVersion(ctx, packageVersionStr);

    // Commit the bumped package.
    await ctx.git.commit(`bump package.json version to ${packageVersionStr}`, [
      "./package.json",
    ]);
    await ctx.git.push({ force: true }, releaseBranch);

    // Restore branch back to where it was.
    await ctx.git.checkout(baseBranch);

    const header = `> [!important]
> Merging this PR will publish ${packageVersionStr}

---
`;
    // Start with an empty changelog, as it will be filled after it's created.
    const body = changelog.generate(header, []);

    // Create new release PR.
    releasePr = await ctx.repo.createPullRequest({
      head: releaseBranch,
      base: baseBranch,
      title: `Release ${packageVersionStr}`,
      body,
    });
    releaseVersion = packageVersionStr;
  }

  // Optionally update the changelog if the merged PR allows it.
  if (changelogItems.length > 0) {
    // Update the changelog with this merged PR.
    await releasePr.update({
      body: changelogItems.reduce(
        (body, item) => changelog.appendItem(body, item),
        releasePr.body ?? "",
      ),
    });
  }

  return {
    releasePrNumber: releasePr.number,
    releasePrHead: releasePr.head,
    releaseVersion,
  };
}
