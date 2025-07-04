import { describe, beforeEach, it } from "vitest";

import { run } from "./main";

import type { Ctx } from "@/lib";
import type { PullRequest } from "@/lib/github";

describe("get-pr-severity", () => {
  let ctx: Ctx;

  beforeEach(() => {
    ctx = {} as unknown as Ctx;
  });

  it.for([
    ["major", "major"],
    ["minor", "minor"],
    ["patch", "minor"],
  ])(
    "detects %s version label, ignoring other labels",
    async ([version, severity], { expect }) => {
      ctx.pr = {
        labels: [{ name: "Review: Code" }, { name: `version: ${version}` }],
      } as unknown as PullRequest;

      await expect(run(ctx)).resolves.toStrictEqual({ severity });
    },
  );

  it("rejects if multiple version labels provided", async ({ expect }) => {
    ctx.pr = {
      labels: [{ name: `version: major` }, { name: `version: minor` }],
    } as unknown as PullRequest;

    await expect(run(ctx)).rejects.toThrowError(
      "multiple version labels detected",
    );
  });

  it("defaults to `minor` if no version label detected", async ({ expect }) => {
    ctx.pr = {
      labels: [],
    } as unknown as PullRequest;

    await expect(run(ctx)).resolves.toEqual({ severity: "minor" });
  });
});
