import { changelog, type Ctx } from "@/lib";

export async function run(ctx: Ctx) {
  if (!ctx.pr) {
    throw new Error("can only extract changelog from a running PR");
  }

  const { items } = changelog.parse(ctx.pr.body ?? "");

  return { changelog: items.map((item) => `- ${item}`).join("\n") };
}
