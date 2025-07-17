import type { OctokitResponse } from "@octokit/types";
import { describe, afterEach, beforeEach, it, vi } from "vitest";

import { getNextCutVersion, run } from "./main";

import { changelog, type Ctx } from "@/lib";
import {
  Repository,
  type GithubRepository,
  type Octokit,
  type PullRequest,
} from "@/lib/github";
import {
  CHANGELOG_LABEL,
  MAJOR_SEVERITY_LABEL,
  MINOR_SEVERITY_LABEL,
} from "@/lib/labels";
import { asyncIterable, mockPr } from "@/lib/test-utils";

describe("create-cut-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    ctx = {
      context: {
        refName: "main",
      },
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
        pullRequests: vi.fn().mockReturnValue(asyncIterable([])),
        branches: vi.fn().mockReturnValue(asyncIterable([])),
        createPullRequest: vi.fn(),
      },
      exec: vi.fn(),
      execOutput: vi.fn(),
    } as unknown as Ctx;
  });

  describe.for([
    ["with no other release branches", [], "0.0", "0.0"],
    ["with one other release branch", ["release/1.0"], "1.1", "2.0"],
    [
      "with multiple other release branch",
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
        ctx.pr = mockPr({
          number: 111,
          title: "my feature",
          head: "feat/my-feature",
          labels: [CHANGELOG_LABEL, severity],
        }) as PullRequest;
      });

      it("create new cut PR", async ({ expect }) => {
        const createdPr = {
          ...mockPr({
            number: 222,
            head: `cut/${version}`,
            base: `release/${version}`,
            body: changelog.generate("# Some header\n", []),
          }),
          update: vi.fn(),
        };
        ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

        await expect(run(ctx)).resolves.toStrictEqual({
          cutPrNumber: 222,
          cutBranch: `release/${version}`,
        });

        // Verify git operations.
        expect(ctx.git.createBranch).toHaveBeenCalledTimes(2);
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          1,
          `cut/${version}`,
        );
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          2,
          `release/${version}`,
        );
        expect(ctx.git.checkout).toBeCalledTimes(2);
        expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, `cut/${version}`);
        expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "main");
        expect(ctx.git.commit).toHaveBeenCalledTimes(1);
        expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
          `cut/${version}`,
          `release/${version}`,
        );

        expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
          "-i",
          `.version = "${version}.x"`,
          "./package.json",
        ]);

        // Ensure created PR.
        expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
          head: `cut/${version}`,
          base: `release/${version}`,
          title: `chore(release): cut ${version} release`,
          body: expect.any(String),
        });

        expect(createdPr.update).toHaveBeenCalledExactlyOnceWith({
          body: expect.stringContaining("- my feature"),
        });
      });

      it("re-use existing cut branch", async ({ expect }) => {
        const cutPr = {
          ...mockPr({
            number: 222,
            head: `cut/${version}`,
            base: `release/${version}`,
            body: changelog.generate("# Some header\n", ["item a", "item b"]),
          }),
          update: vi.fn(),
        };
        ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([cutPr]));

        await expect(run(ctx)).resolves.toStrictEqual({
          cutPrNumber: 222,
          cutBranch: `release/${version}`,
        });

        // Verify git operations.
        expect(ctx.git.createBranch).not.toHaveBeenCalled();
        expect(ctx.git.checkout).not.toHaveBeenCalled();
        expect(ctx.git.commit).not.toHaveBeenCalled();
        expect(ctx.git.push).not.toHaveBeenCalled();

        expect(ctx.exec).not.toHaveBeenCalled();

        // Ensure created PR.
        expect(ctx.repo.createPullRequest).not.toHaveBeenCalled();

        expect(cutPr.update).toHaveBeenCalledExactlyOnceWith({
          body: expect.stringContaining("- item a\n- item b\n- my feature"),
        });
      });
    });

    it.skipIf(branches.length == 0)(
      "upgrade existing cut pr",
      async ({ expect }) => {
        ctx.pr = mockPr({
          number: 111,
          title: "my feature",
          head: "feat/my-feature",
          labels: [CHANGELOG_LABEL, MAJOR_SEVERITY_LABEL],
        }) as PullRequest;

        const cutPr = {
          ...mockPr({
            number: 222,
            head: `cut/${minorVersion}`,
            base: `release/${minorVersion}`,
            body: changelog.generate("# Some header\n", ["item a", "item b"]),
          }),
          close: vi.fn(),
        };
        ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([cutPr]));

        const createdPr = {
          ...mockPr({
            number: 333,
            head: `cut/${majorVersion}`,
            base: `release/${majorVersion}`,
            body: changelog.generate("# Some header\n", []),
          }),
          update: vi.fn(),
        };
        ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

        await expect(run(ctx)).resolves.toStrictEqual({
          cutPrNumber: 333,
          cutBranch: `release/${majorVersion}`,
        });

        // Verify git operations.
        expect(ctx.git.createBranch).toHaveBeenCalledTimes(2);
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          1,
          `cut/${majorVersion}`,
        );
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          2,
          `release/${majorVersion}`,
        );
        expect(ctx.git.checkout).toBeCalledTimes(2);
        expect(ctx.git.checkout).toHaveBeenNthCalledWith(
          1,
          `cut/${majorVersion}`,
        );
        expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "main");
        expect(ctx.git.commit).toHaveBeenCalledTimes(1);
        expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
          `cut/${majorVersion}`,
          `release/${majorVersion}`,
        );

        expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
          "-i",
          `.version = "${majorVersion}.x"`,
          "./package.json",
        ]);

        // Ensure created PR.
        expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
          head: `cut/${majorVersion}`,
          base: `release/${majorVersion}`,
          title: `chore(release): cut ${majorVersion} release`,
          body: expect.any(String),
        });

        // Ensure changelog is updated with previous items
        expect(createdPr.update).toHaveBeenCalledExactlyOnceWith({
          body: expect.stringContaining("- item a\n- item b\n- my feature"),
        });

        // Ensure previous cut PR is closed.
        expect(cutPr.close).toHaveBeenCalled();
      },
    );

    it("on commit push", async ({ expect }) => {
      const version = minorVersion;

      const createdPr = {
        ...mockPr({
          number: 222,
          head: `cut/${version}`,
          base: `release/${version}`,
          body: changelog.generate("# Some header\n", []),
        }),
        update: vi.fn(),
      };
      ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

      await expect(run(ctx)).resolves.toStrictEqual({
        cutPrNumber: 222,
        cutBranch: `release/${version}`,
      });

      // Verify git operations.
      expect(ctx.git.createBranch).toHaveBeenCalledTimes(2);
      expect(ctx.git.createBranch).toHaveBeenNthCalledWith(1, `cut/${version}`);
      expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
        2,
        `release/${version}`,
      );
      expect(ctx.git.checkout).toBeCalledTimes(2);
      expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, `cut/${version}`);
      expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "main");
      expect(ctx.git.commit).toHaveBeenCalledTimes(1);
      expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
        `cut/${version}`,
        `release/${version}`,
      );

      expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
        "-i",
        `.version = "${version}.x"`,
        "./package.json",
      ]);

      // Ensure created PR.
      expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
        head: `cut/${version}`,
        base: `release/${version}`,
        title: `chore(release): cut ${version} release`,
        body: expect.any(String),
      });

      expect(createdPr.update).not.toHaveBeenCalled();
    });
  });
});

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
