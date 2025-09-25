import { changelog, type Ctx } from "@/lib";

type ChangelogResult = {
  changelog: string;
};

// eslint-disable-next-line @typescript-eslint/require-await
export async function run(ctx: Ctx): Promise<ChangelogResult> {
  if (!ctx.pr) {
    throw new Error("can only extract changelog from a running PR");
  }

  const { items } = changelog.parse(ctx.pr.body ?? "");

  return { changelog: items.map((item) => `- ${item}`).join("\n") };
}
