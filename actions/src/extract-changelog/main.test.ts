import { describe, beforeEach, it, vi } from "vitest";

import type { Ctx } from "@/lib";
import { mockCutPr } from "@/lib/test-utils";

import { run } from "./main";

describe("create-cut-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    ctx = {
      context: {},
      git: {},
      repo: {},
      exec: vi.fn(),
      execOutput: vi.fn(),
      pr: mockCutPr({ changelog: ["item a", "item b", "item c"] }),
    } as unknown as Ctx;
  });

  it("extracts the changelog", async ({ expect }) => {
    const { changelog } = await run(ctx);
    expect(changelog).toBe("- item a\n- item b\n- item c");
  });
});
