import { type Ctx } from "@/lib";

/**
 * Read and parse the version from `package.json`.
 */
export async function getPackageVersion(ctx: Ctx): Promise<string> {
  const { stdout } = await ctx.execOutput("yq", [
    "-r",
    ".version",
    "./package.json",
  ]);

  return stdout.trim();
}

/**
 * Update `package.json` with the provided version.
 */
export async function setPackageVersion(ctx: Ctx, version: string) {
  await ctx.exec("yq", ["-i", `.version = "${version}"`, "./package.json"]);
}
