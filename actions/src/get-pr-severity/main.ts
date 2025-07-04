import { type Ctx, versioning } from "@/lib";

export async function run(ctx: Ctx) {
  if (!ctx.pr) {
    throw new Error(
      "this action must be triggered from a `pull_request` event, or provided a `pr_number`.",
    );
  }

  // Determine whether the PR is major/minor/patch.
  const version =
    versioning.versionFromLabels(ctx.pr.labels.map(({ name }) => name)) ??
    "patch";

  // Determine the severity from the version.
  const severity = versioning.severityFromVersion(version);

  return { severity };
}
