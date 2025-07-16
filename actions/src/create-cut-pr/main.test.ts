import { describe, beforeEach, it, vi } from "vitest";

import { run } from "./main";

import { changelog, type Ctx } from "@/lib";
import type { PullRequest } from "@/lib/github";
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
      ["minor", minorVersion],
      ["major", majorVersion],
    ])("with %s feature branch", ([severity, version]) => {
      beforeEach(() => {
        ctx.pr = mockPr({
          number: 111,
          title: "my feature",
          head: "feat/my-feature",
          labels: ["changelog", `version: ${severity}`],
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
          labels: ["changelog", "version: major"],
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
