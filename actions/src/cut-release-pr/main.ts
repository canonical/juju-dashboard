import { changelog, createCtx, release, versioning } from "@/lib";
import { versionFromLabels, changelogFromLabels } from "@/lib/versioning";

export async function run() {
  const ctx = await createCtx({ pullRequestInput: "pull-request" });

  if (!ctx.pr) {
    throw new Error(
      "`cut-release-pr` can only be run when triggered from a merged PR",
    );
  }

  const labels = ctx.pr.labels.map(({ name }) => name);

  // Determine if the PR should be included in the changelog.
  const prChangelog = changelogFromLabels(labels);
  if (!prChangelog) {
    return;
  }

  // Determine the severity of the pull request.
  const prVersion = versionFromLabels(labels);

  // Find the cut PR.
  const cutPr = await release.getCutPr(
    ctx,
    versioning.severityFromVersion(prVersion),
  );

  // Update the PR changelog.
  await cutPr.update({
    body: changelog.appendItem(cutPr.body, ctx.pr.title, cutPr.base),
  });
}
