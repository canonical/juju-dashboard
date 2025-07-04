import { type Ctx, changelog } from "@/lib";
import { PullRequest } from "@/lib/github";

export async function run(ctx: Ctx, { cutPrNumber }: { cutPrNumber: number }) {
  if (!ctx.pr) {
    throw new Error(
      "this action must be triggered from a `pull_request` event, or provided a `pr_number`.",
    );
  }

  const cutPr = await PullRequest.get(
    ctx.octokit,
    ctx.repo.identifier,
    cutPrNumber,
  );

  const updatedBody = changelog.appendItem(cutPr.body, ctx.pr.title);
  await cutPr.update({ body: updatedBody });
}
