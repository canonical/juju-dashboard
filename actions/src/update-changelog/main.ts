import { type Ctx, changelog } from "@/lib";
import { PullRequest } from "@/lib/github";
import { CHANGELOG_LABEL } from "@/lib/labels";

export async function run(ctx: Ctx, { cutPrNumber }: { cutPrNumber: number }) {
  if (!ctx.pr) {
    throw new Error(
      "this action must be triggered from a `pull_request` event, or provided a `pr_number`.",
    );
  }

  ctx.core.info(`running on pull request #${ctx.pr.number}`);

  if (!ctx.pr.hasLabel(CHANGELOG_LABEL)) {
    ctx.core.info(
      `pull request doesn't have the ${CHANGELOG_LABEL} label, skipping`,
    );

    return;
  }

  const cutPr = await PullRequest.get(
    ctx.octokit,
    ctx.repo.identifier,
    cutPrNumber,
  );

  ctx.core.info(`using release cut pull request #${cutPr.number}`);

  const updatedBody = changelog.appendItem(cutPr.body, ctx.pr.title);
  await cutPr.update({ body: updatedBody });
}
