import type * as FsModule from "node:fs/promises";

import type { OctokitResponse } from "@octokit/types";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

import type { Ctx } from "@/lib";
import { Repository, type GithubRepository, type Octokit } from "@/lib/github";
import {
  CHANGELOG_LABEL,
  MAJOR_SEVERITY_LABEL,
  MINOR_SEVERITY_LABEL,
} from "@/lib/labels";
import { asyncIterable, mockPr } from "@/lib/test-utils";

import { getNextCutVersion, run } from "./main";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof FsModule;
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

function mockMergedPrs(
  ctx: Ctx,
  prs: {
    merged_at?: null | string;
    base: { ref: string };
    head: { ref: string };
    number: number;
    labels: { name: string }[];
    state?: string;
    title?: string;
    body?: null | string;
    url?: string;
    user?: { login: string };
    id?: number;
  }[],
): MockInstance {
  return vi.mocked(
    ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit as (request: unknown) => unknown,
  ).mockResolvedValue({ data: prs } as unknown);
}

describe("create-cut-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    vi.clearAllMocks();
    const octokit = {
      rest: {
        pulls: { list: vi.fn() },
        repos: { listPullRequestsAssociatedWithCommit: vi.fn() },
      },
      paginate: { iterator: vi.fn() },
    } as unknown as Octokit;

    ctx = {
      context: { refName: "main", sha: "abc123" },
      octokit,
      git: {
        mainBranch: "main",
        configUser: vi.fn(),
        checkout: vi.fn(),
        createBranch: vi.fn(),
        moveBranch: vi.fn(),
        commit: vi.fn(),
        push: vi.fn(),
        fetch: vi.fn(),
      },
      repo: {
        defaultBranch: "main",
        identifier: { owner: "owner", repo: "repo" },
        pullRequests: vi.fn().mockReturnValue(asyncIterable([])),
        branches: vi.fn().mockReturnValue(asyncIterable([])),
        createPullRequest: vi.fn(),
      },
      exec: vi.fn(),
      execOutput: vi.fn(),
    } as unknown as Ctx;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.for([
    ["with no other release branches", [], "0.0", "0.0"],
    ["with one other release branch", ["release/1.0"], "1.1", "2.0"],
    [
      "with multiple other release branches",
      ["release/1.0", "release/1.1", "release/2.0"],
      "2.1",
      "3.0",
    ],
  ] as const)("%s", ([_, branches, minorVersion, majorVersion]) => {
    beforeEach(() => {
      ctx.repo.branches = vi
        .fn()
        .mockReturnValue(
          asyncIterable(branches.map((name: string) => ({ name }))),
        );
    });

    describe.for([
      [MINOR_SEVERITY_LABEL, minorVersion],
      [MAJOR_SEVERITY_LABEL, majorVersion],
    ])("with %s feature branch", ([severity, version]) => {
      beforeEach(() => {
        mockMergedPrs(ctx, [
          {
            number: 111,
            base: { ref: "main" },
            head: { ref: "feat/my-feature" },
            merged_at: "2026-01-01T00:00:00Z",
            labels: [{ name: CHANGELOG_LABEL }, { name: severity }],
            state: "closed",
            title: "my feature",
            body: null,
            url: "https://github.com/owner/repo/pull/111",
            user: { login: "user" },
            id: 111,
          },
        ]);
      });

      it("creates new cut PR", async ({ expect }) => {
        const createdPr = {
          ...mockPr({
            number: 222,
            head: `cut/${version}`,
            base: `release/${version}`,
          }),
          update: vi.fn(),
        };
        ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

        await expect(run(ctx)).resolves.toStrictEqual({
          cutPrNumber: 222,
          cutBranch: `release/${version}`,
        });

        expect(ctx.git.createBranch).toHaveBeenCalledTimes(2);
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          1,
          `cut/${version}`,
        );
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          2,
          `release/${version}`,
        );
        expect(ctx.git.checkout).toHaveBeenCalledTimes(2);
        expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, `cut/${version}`);
        expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "main");
        expect(ctx.git.commit).toHaveBeenCalledTimes(1);
        expect(ctx.git.commit).toHaveBeenCalledWith(
          `chore(release): cut ${version} release`,
          ["./package.json", "./CHANGELOG.md"],
        );
        expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
          `cut/${version}`,
          `release/${version}`,
        );

        expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
          "-i",
          `.version = "${version}.x"`,
          "./package.json",
        ]);

        expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
          head: `cut/${version}`,
          base: `release/${version}`,
          title: `chore(release): cut ${version} release`,
          body: expect.any(String),
        });
      });
    });
  });

  it("keeps the changelog from main for any release", async ({
    expect,
  }) => {
    mockMergedPrs(ctx, [
      {
        number: 111,
        base: { ref: "main" },
        head: { ref: "feat/breaking" },
        merged_at: "2026-01-01T00:00:00Z",
        labels: [{ name: CHANGELOG_LABEL }, { name: MAJOR_SEVERITY_LABEL }],
        state: "closed",
        title: "breaking feature",
        body: null,
        url: "https://github.com/owner/repo/pull/111",
        user: { login: "user" },
        id: 111,
      },
    ]);
    ctx.repo.branches = vi
      .fn()
      .mockReturnValue(asyncIterable([{ name: "release/1.0" }]));
    const createdPr = {
      ...mockPr({
        number: 222,
        head: "cut/2.0",
        base: "release/2.0",
      }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);
    const { writeFile } = await import("node:fs/promises");

    await run(ctx);

    expect(writeFile).not.toHaveBeenCalled();
    expect(ctx.git.commit).toHaveBeenCalledWith(
      expect.stringContaining("chore(release): cut"),
      ["./package.json", "./CHANGELOG.md"],
    );
  });

  it("defaults to minor severity on direct pushes", async ({ expect }) => {
    mockMergedPrs(ctx, []);
    ctx.repo.branches = vi.fn().mockReturnValue(asyncIterable([]));
    const createdPr = {
      ...mockPr({ number: 222, head: "cut/0.0", base: "release/0.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      cutPrNumber: 222,
      cutBranch: "release/0.0",
    });

    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "0.0.x"`,
      "./package.json",
    ]);
  });

  it("reuses an existing cut PR when severity matches", async ({ expect }) => {
    mockMergedPrs(ctx, [
      {
        number: 111,
        base: { ref: "main" },
        head: { ref: "feat/my-feature" },
        merged_at: "2026-01-01T00:00:00Z",
        labels: [{ name: CHANGELOG_LABEL }, { name: MINOR_SEVERITY_LABEL }],
        state: "closed",
        title: "my feature",
        body: null,
        url: "https://github.com/owner/repo/pull/111",
        user: { login: "user" },
        id: 111,
      },
    ]);
    ctx.repo.branches = vi
      .fn()
      .mockReturnValue(asyncIterable([{ name: "release/0.0" }]));
    const existingPr = {
      ...mockPr({ number: 222, head: "cut/0.1", base: "release/0.1" }),
      update: vi.fn(),
    };
    ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([existingPr]));

    await expect(run(ctx)).resolves.toStrictEqual({
      cutPrNumber: 222,
      cutBranch: "release/0.1",
    });

    expect(ctx.git.createBranch).not.toHaveBeenCalled();
    expect(ctx.git.commit).not.toHaveBeenCalled();
    expect(ctx.git.push).not.toHaveBeenCalled();
    expect(ctx.repo.createPullRequest).not.toHaveBeenCalled();
    expect(existingPr.update).not.toHaveBeenCalled();
  });

  it("closes an existing cut PR when severity changes", async ({ expect }) => {
    mockMergedPrs(ctx, [
      {
        number: 111,
        base: { ref: "main" },
        head: { ref: "feat/breaking" },
        merged_at: "2026-01-01T00:00:00Z",
        labels: [{ name: CHANGELOG_LABEL }, { name: MAJOR_SEVERITY_LABEL }],
        state: "closed",
        title: "breaking feature",
        body: null,
        url: "https://github.com/owner/repo/pull/111",
        user: { login: "user" },
        id: 111,
      },
    ]);
    ctx.repo.branches = vi
      .fn()
      .mockReturnValue(asyncIterable([{ name: "release/1.0" }]));
    const stalePr = {
      ...mockPr({ number: 222, head: "cut/1.1", base: "release/1.1" }),
      close: vi.fn(),
    };
    ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([stalePr]));
    const createdPr = {
      ...mockPr({ number: 333, head: "cut/2.0", base: "release/2.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      cutPrNumber: 333,
      cutBranch: "release/2.0",
    });

    expect(stalePr.close).toHaveBeenCalled();
    expect(ctx.repo.createPullRequest).toHaveBeenCalled();
  });

  describe("getNextCutVersion", () => {
    const octokit = {
      rest: { repos: { listBranches: {} } },
      paginate: { iterator: vi.fn() },
    } as unknown as Octokit;
    const repoCtx: Ctx = {
      repo: new Repository(
        octokit,
        {
          owner: { login: "some-owner" },
          name: "some-repository",
        } as unknown as GithubRepository,
      ),
      octokit,
    } as unknown as Ctx;

    function mockListBranches(branches: string[]): MockInstance {
      return vi
        .spyOn(repoCtx.octokit.paginate, "iterator")
        .mockImplementation(() => {
          return (async function* (): AsyncGenerator<
            OctokitResponse<unknown, number>
          > {
            yield {
              data: branches.map((name) => ({ name })),
            } as OctokitResponse<unknown>;
          })();
        });
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("falls back to `0.0` if no release branches found", async ({
      expect,
    }) => {
      mockListBranches([]);
      expect(await getNextCutVersion(repoCtx, "minor")).toStrictEqual({
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
      expect(await getNextCutVersion(repoCtx, "minor")).toStrictEqual({
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
      expect(await getNextCutVersion(repoCtx, "major")).toStrictEqual({
        major: 2,
        minor: 0,
      });
    });

    it("ignores non-release branches", async ({ expect }) => {
      mockListBranches([
        "main",
        "release/0.0",
        "some-feature",
        "cut/1.0",
        "release/1.0",
      ]);
      expect(await getNextCutVersion(repoCtx, "minor")).toStrictEqual({
        major: 1,
        minor: 1,
      });
    });

    it("handles out-of-order branches", async ({ expect }) => {
      mockListBranches([
        "release/1.0",
        "release/0.1",
        "release/0.0",
        "release/1.1",
      ]);
      expect(await getNextCutVersion(repoCtx, "minor")).toStrictEqual({
        major: 1,
        minor: 2,
      });
    });
  });
});
