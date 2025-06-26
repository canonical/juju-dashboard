import type { OctokitResponse } from "@octokit/types";
import { describe, it, vi, afterEach } from "vitest";

import { Repository, type Octokit, type GithubRepository } from "./github";
import { getNextCutVersion } from "./release";

import type { Ctx } from ".";

describe("getNextCutVersion", () => {
  const octokit = {
    rest: { repos: { listBranches: {} } },
    paginate: { iterator: vi.fn() },
  } as unknown as Octokit;

  const ctx: Ctx = {
    repo: new Repository(octokit, {
      owner: { login: "some-owner" },
      name: "some-repository",
    } as unknown as GithubRepository),
    octokit,
  } as unknown as Ctx;

  function mockListBranches(branches: string[]) {
    return vi.spyOn(ctx.octokit.paginate, "iterator").mockImplementation(() => {
      return (async function* () {
        yield {
          data: branches.map((branch) => ({ name: branch })),
        } as OctokitResponse<unknown>;
      })();
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to `0.0` if no release branches found", async ({ expect }) => {
    mockListBranches([]);
    expect(await getNextCutVersion(ctx, "minor")).toStrictEqual({
      major: 0,
      minor: 0,
    });
  });

  it("produces next minor version", async ({ expect }) => {
    mockListBranches([
      "release/0.0",
      "release/0.1",
      "release/1.0",
      "release/1.1",
    ]);
    expect(await getNextCutVersion(ctx, "minor")).toStrictEqual({
      major: 1,
      minor: 2,
    });
  });

  it("produces next major version", async ({ expect }) => {
    mockListBranches([
      "release/0.0",
      "release/0.1",
      "release/1.0",
      "release/1.1",
    ]);
    expect(await getNextCutVersion(ctx, "major")).toStrictEqual({
      major: 2,
      minor: 0,
    });
  });

  it("handles out of order branches", async ({ expect }) => {
    mockListBranches([
      "release/1.0",
      "release/0.1",
      "release/0.0",
      "release/1.1",
    ]);
    expect(await getNextCutVersion(ctx, "major")).toStrictEqual({
      major: 2,
      minor: 0,
    });
  });

  it("ignores non-release branches", async ({ expect }) => {
    mockListBranches([
      "release/0.0",
      "release/1.2.3",
      "release/0.1",
      "something-cool",
      "release/1.0",
      "feat/important",
      "release/1.1",
      "cut/release/1.2",
    ]);
    expect(await getNextCutVersion(ctx, "major")).toStrictEqual({
      major: 2,
      minor: 0,
    });
  });
});
