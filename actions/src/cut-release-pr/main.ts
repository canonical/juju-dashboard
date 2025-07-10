import { release, type Ctx } from "@/lib";
import type { Severity } from "@/lib/versioning";

export async function run(ctx: Ctx, { severity }: { severity: Severity }) {
  // Fetch or create the cut PR.
  const pr = await release.getCutPr(ctx, severity);

  // Ensure that PR is up to date with main, if triggered by a PR to main.
  if (ctx.context.refName === ctx.git.mainBranch) {
    await ctx.git.moveBranch(pr.base, ctx.git.mainBranch);
    await ctx.git.push({ force: true }, pr.base);
  }

  return { cutPrNumber: pr.number, cutBranch: pr.base };
}
