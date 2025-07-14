import { describe, beforeEach, it, vi } from "vitest";

import { run } from "./main";

import type { Ctx } from "@/lib";
import { CHANGELOG_END_MARKER, CHANGELOG_START_MARKER } from "@/lib/changelog";
import type { PullRequest } from "@/lib/github";
import type { Severity } from "@/lib/versioning";

async function* asyncIterable<T>(items: T[]) {
  yield* items;
}

function mockPr({
  number = 123,
  base = "main",
  head,
  labels = [],
  body = "",
}: {
  number?: number;
  base?: string;
  head: string;
  labels?: string[];
  body?: string;
}) {
  return {
    number,
    base,
    head,
    labels: labels.map((name) => ({ name })),
    body,
  };
}

function mockCutPr({
  severity = "minor",
  version = "1.0",
  patchVersion,
  headSuffix,
  number = 123,
  additionalLabels = [],
  changelog = [],
}: {
  /** Severity of the pull request. */
  severity?: Severity;
  /** Version of the pull request. */
  version?: `${number}.${number}`;
  /** Optional beta version to append to head branch. */
  patchVersion?: number;
  /** Optional suffix for the `head` branch. */
  headSuffix?: string;
  /** Pull request number. */
  number?: number;
  /** If `true`, default release labels will be included. */
  defaultLabels?: boolean;
  /** Additional labels to add to the pull request. */
  additionalLabels?: string[];
  changelog?: string[];
} = {}) {
  const labels = [
    "release: cut",
    `release-severity: ${severity}`,
    ...additionalLabels,
  ];

  let headBranchSuffix = "";
  if (patchVersion !== undefined) {
    headBranchSuffix += `.${patchVersion}`;
  }
  if (headSuffix) {
    headBranchSuffix += `-${headSuffix}`;
  }

  return mockPr({
    number,
    base: `release/${version}`,
    head: `cut/release/${version}${headBranchSuffix}`,
    labels,
    body: [
      "",
      CHANGELOG_START_MARKER,
      ...changelog.map((item) => `- ${item}`),
      CHANGELOG_END_MARKER,
    ].join("\n"),
  });
}

describe("cut-release-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    ctx = {
      context: {},
      pr: {
        head: "feat/some-feature",
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
        pullRequests: vi.fn(),
        branches: vi
          .fn()
          .mockReturnValue(
            asyncIterable([
              { name: "main" },
              { name: "feat/something" },
              { name: "release/1.0" },
              { name: "release/1.1" },
            ]),
          ),
        createPullRequest: vi.fn(),
      },
      exec: vi.fn(),
      execOutput: vi.fn(),
    } as unknown as Ctx;
  });

  describe("branch main", () => {
    beforeEach(() => {
      ctx.context.refName = "main";
    });

    const BETA_CUT_PR = mockCutPr({
      number: 111,
      version: "1.1",
      patchVersion: 2,
      headSuffix: "beta.3",
    });

    const RANDOM_FEATURE_PR = mockPr({
      number: 999,
      head: "feat/my-feature",
      labels: ["Review: Code", "changelog"],
    });

    describe.for([
      ["no extra PRs", []],
      ["random feature PR", [RANDOM_FEATURE_PR]],
      ["beta cut PR", [BETA_CUT_PR]],
      ["random feature PR and beta cut PR", [RANDOM_FEATURE_PR, BETA_CUT_PR]],
    ] as [string, ReturnType<typeof mockPr>[]][])("%s", ([_, pullRequests]) => {
      it("use existing release branch", async ({ expect }) => {
        ctx.repo.pullRequests = vi
          .fn()
          .mockReturnValue(
            asyncIterable([mockCutPr({ version: "1.2" }), ...pullRequests]),
          );

        await expect(run(ctx, { severity: "minor" })).resolves.toStrictEqual({
          cutPrNumber: 123,
          cutBranch: "release/1.2",
        });

        expect(ctx.repo.pullRequests).toHaveBeenCalledOnce();
        expect(ctx.git.moveBranch).toHaveBeenCalledExactlyOnceWith(
          "release/1.2",
          "main",
        );
        expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
          { force: true },
          "release/1.2",
        );
      });

      it("cut new PR if required", async ({ expect }) => {
        ctx.repo.pullRequests = vi
          .fn()
          .mockReturnValue(asyncIterable(pullRequests));

        const createdPr = {
          ...mockCutPr({ version: "1.2" }),
          setLabels: vi.fn(),
        };
        ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

        await expect(run(ctx, { severity: "minor" })).resolves.toStrictEqual({
          cutPrNumber: 123,
          cutBranch: "release/1.2",
        });

        // Branches created
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          1,
          "release/1.2",
          "origin/main",
        );
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          2,
          "cut/release/1.2",
          "release/1.2",
        );

        // Update package.json version
        expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
          "-i",
          `.version = "1.2.x"`,
          "./package.json",
        ]);

        // Commit change
        expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
          "update package.json version to 1.2.x",
          ["./package.json"],
        );

        // Push new branches
        expect(ctx.git.push).toHaveBeenNthCalledWith(1, "release/1.2");
        expect(ctx.git.push).toHaveBeenNthCalledWith(2, "cut/release/1.2");

        // Pull request created with labels
        expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
          base: "release/1.2",
          head: "cut/release/1.2",
          title: "chore(release): cut 1.2 release",
          body: expect.any(String),
        });
        expect(createdPr.setLabels).toHaveBeenCalledExactlyOnceWith([
          "release: cut",
          "release-severity: minor",
        ]);
      });

      it("upgrade existing minor PR to major", async ({ expect }) => {
        const existingPr = { ...mockCutPr({ version: "1.2" }), close: vi.fn() };
        ctx.repo.pullRequests = vi
          .fn()
          .mockReturnValue(asyncIterable([existingPr, ...pullRequests]));

        const createdPr = {
          ...mockCutPr({ number: 543, version: "2.0" }),
          setLabels: vi.fn(),
        };
        ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

        await expect(run(ctx, { severity: "major" })).resolves.toStrictEqual({
          cutPrNumber: 543,
          cutBranch: "release/2.0",
        });

        expect(ctx.repo.pullRequests).toHaveBeenCalledOnce();

        // Branches created
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          1,
          "release/2.0",
          "origin/main",
        );
        expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
          2,
          "cut/release/2.0",
          "release/2.0",
        );

        // Update package.json version
        expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
          "-i",
          `.version = "2.0.x"`,
          "./package.json",
        ]);

        // Commit change
        expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
          "update package.json version to 2.0.x",
          ["./package.json"],
        );

        // Push new branches
        expect(ctx.git.push).toHaveBeenNthCalledWith(1, "release/2.0");
        expect(ctx.git.push).toHaveBeenNthCalledWith(2, "cut/release/2.0");

        // Pull request created with labels
        expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
          base: "release/2.0",
          head: "cut/release/2.0",
          title: "chore(release): cut 2.0 release",
          body: expect.any(String),
        });
        expect(createdPr.setLabels).toHaveBeenCalledExactlyOnceWith([
          "release: cut",
          "release-severity: major",
        ]);

        expect(ctx.git.moveBranch).toHaveBeenCalledExactlyOnceWith(
          "release/2.0",
          "main",
        );
        expect(ctx.git.push).toHaveBeenNthCalledWith(
          3,
          { force: true },
          "release/2.0",
        );

        // Previous pull request closed
        expect(existingPr.close).toHaveBeenCalledOnce();
      });

      it("reject multiple cut release PR", async ({ expect }) => {
        ctx.repo.pullRequests = vi
          .fn()
          .mockReturnValue(
            asyncIterable([
              mockCutPr({ version: "1.2" }),
              mockCutPr({ version: "1.3" }),
              ...pullRequests,
            ]),
          );

        await expect(run(ctx, { severity: "minor" })).rejects.toThrowError(
          "Multiple open cut PRs were found",
        );
      });
    });
  });

  describe.for([
    ["release/1.0", "1.0", { isMajor: true }],
    ["release/1.1", "1.1", { isMajor: false }],
  ] as const)("branch %s", ([branch, versionPrefix, { isMajor }]) => {
    beforeEach(() => {
      ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([]));
      ctx.context.refName = branch;
    });

    describe.for([["major"], ["minor"]] as [Severity][])(
      "severity %s",
      ([severity]) => {
        describe.for([
          [`${versionPrefix}.x`, "0"],
          [`${versionPrefix}.0-beta.0`, "1"],
          [`${versionPrefix}.0-beta.7`, "8"],
        ])("package version %s", ([packageVersion, betaVersion]) => {
          beforeEach(() => {
            ctx.execOutput = vi
              .fn()
              .mockResolvedValue({ stdout: packageVersion });
          });

          const canCreatePr = isMajor || severity === "minor";

          // This test ensures that a cut PR is created, however it will fail (by design) if the
          // severity is major and the release isn't major.
          it.runIf(canCreatePr)("create cut PR", async ({ expect }) => {
            const createdPr = {
              ...mockCutPr({
                version: versionPrefix,
                patchVersion: 0,
                headSuffix: `beta.${betaVersion}`,
              }),
              setLabels: vi.fn(),
            };
            ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

            await expect(run(ctx, { severity })).resolves.toStrictEqual({
              cutPrNumber: 123,
              cutBranch: `release/${versionPrefix}`,
            });

            // Ensure `package.json` version was read.
            expect(ctx.execOutput).toHaveBeenCalledExactlyOnceWith("yq", [
              "-r",
              ".version",
              "./package.json",
            ]);

            // Branches created
            expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
              1,
              `cut/release/${versionPrefix}.0-beta.${betaVersion}`,
              `release/${versionPrefix}`,
            );

            // Update package.json version
            expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
              "-i",
              `.version = "${versionPrefix}.0-beta.${betaVersion}"`,
              "./package.json",
            ]);

            // Commit change
            expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
              `update package.json version to ${versionPrefix}.0-beta.${betaVersion}`,
              ["./package.json"],
            );

            // Push new branches
            expect(ctx.git.push).toHaveBeenNthCalledWith(
              1,
              `cut/release/${versionPrefix}.0-beta.${betaVersion}`,
            );

            // Pull request created with labels
            expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
              base: `release/${versionPrefix}`,
              head: `cut/release/${versionPrefix}.0-beta.${betaVersion}`,
              title: `chore(release): cut ${versionPrefix}.0-beta.${betaVersion} release`,
              body: expect.any(String),
            });
            expect(createdPr.setLabels).toHaveBeenCalledExactlyOnceWith([
              "release: cut",
              `release-severity: ${severity}`,
            ]);
          });

          it.runIf(canCreatePr)(
            "re-use existing PR with matching severity",
            async ({ expect }) => {
              ctx.repo.pullRequests = vi.fn().mockReturnValue(
                asyncIterable([
                  mockCutPr({
                    number: 123,
                    version: versionPrefix,
                    patchVersion: 0,
                    headSuffix: `beta.${betaVersion}`,
                    severity,
                  }),
                ]),
              );

              await expect(run(ctx, { severity })).resolves.toStrictEqual({
                cutPrNumber: 123,
                cutBranch: `release/${versionPrefix}`,
              });

              // Nothing should've been done, as the pull request should've been used.
              expect(ctx.exec).not.toHaveBeenCalled();
              expect(ctx.repo.createPullRequest).not.toHaveBeenCalled();
              expect(ctx.git.push).not.toHaveBeenCalled();
              expect(ctx.git.commit).not.toHaveBeenCalled();
            },
          );

          // This test ensures that if the previous test case doesn't run, then it fails with an
          // error.
          it.runIf(!canCreatePr)("rejects major PR", async ({ expect }) => {
            await expect(run(ctx, { severity })).rejects.toThrow(
              "major PR merged into minor release branch",
            );
          });
        });
      },
    );
  });

  describe("cut release branch", () => {
    beforeEach(() => {
      ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([]));
    });

    it("seeds changelog from release cut branch", async ({ expect }) => {
      ctx.pr = mockCutPr({
        changelog: ["item a", "item b", "item c"],
      }) as PullRequest;
      ctx.context.refName = ctx.pr.base;
      ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.x" });

      const createdPr = {
        ...mockCutPr({
          patchVersion: 0,
          headSuffix: "beta.0",
        }),
        setLabels: vi.fn(),
      };
      ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

      await expect(run(ctx, { severity: "major" })).resolves.toStrictEqual({
        cutPrNumber: 123,
        cutBranch: "release/1.0",
      });

      // Pull request created with labels
      expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
        base: `release/1.0`,
        head: `cut/release/1.0.0-beta.0`,
        title: `chore(release): cut 1.0.0-beta.0 release`,
        body: expect.stringContaining("- item a\n- item b\n- item c"),
      });
      expect(createdPr.setLabels).toHaveBeenCalledExactlyOnceWith([
        "release: cut",
        `release-severity: major`,
      ]);
    });

    it("ignores changelog of non-first release cut PR", async ({ expect }) => {
      ctx.pr = mockCutPr({
        patchVersion: 0,
        headSuffix: "beta.0",
        changelog: ["item a", "item b", "item c"],
      }) as PullRequest;
      ctx.context.refName = ctx.pr.base;
      ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0-beta.0" });

      const createdPr = {
        ...mockCutPr({
          patchVersion: 0,
        }),
        setLabels: vi.fn(),
      };
      ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

      await expect(run(ctx, { severity: "major" })).resolves.toStrictEqual({
        cutPrNumber: 123,
        cutBranch: "release/1.0",
      });

      // Pull request created with labels
      expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
        base: `release/1.0`,
        head: `cut/release/1.0.0`,
        title: `chore(release): cut 1.0.0 release`,
        body: expect.not.stringContaining("- item a\n- item b\n- item c"),
      });
      expect(createdPr.setLabels).toHaveBeenCalledExactlyOnceWith([
        "release: cut",
        `release-severity: major`,
      ]);
    });
  });

  describe("merged beta branch", () => {
    beforeEach(() => {
      ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([]));
    });

    describe.for([
      ["1.0.0", "1.0", 0],
      ["1.0.5", "1.0", 5],
      ["1.2.0", "1.2", 0],
      ["1.2.5", "1.2", 5],
    ] as const)(
      "candidate version %s",
      ([candidateVersion, version, patchVersion]) => {
        beforeEach(() => {
          ctx.pr = mockCutPr({
            version,
            patchVersion,
            headSuffix: "beta.7",
          }) as PullRequest;
          ctx.context.refName = `release/${version}`;
          ctx.execOutput = vi
            .fn()
            .mockResolvedValue({ stdout: `${candidateVersion}-beta.7` });
        });

        it("create candidate PR", async ({ expect }) => {
          const createdPr = {
            ...mockCutPr({
              version,
              patchVersion,
            }),
            setLabels: vi.fn(),
          };
          ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

          await expect(run(ctx, { severity: "minor" })).resolves.toStrictEqual({
            cutPrNumber: 123,
            cutBranch: `release/${version}`,
          });

          // Ensure `package.json` version was read.
          expect(ctx.execOutput).toHaveBeenCalledExactlyOnceWith("yq", [
            "-r",
            ".version",
            "./package.json",
          ]);

          // Branches created
          expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
            1,
            `cut/release/${candidateVersion}`,
            `release/${version}`,
          );

          // Update package.json version
          expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
            "-i",
            `.version = "${candidateVersion}"`,
            "./package.json",
          ]);

          // Commit change
          expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
            `update package.json version to ${candidateVersion}`,
            ["./package.json"],
          );

          // Push new branches
          expect(ctx.git.push).toHaveBeenNthCalledWith(
            1,
            `cut/release/${candidateVersion}`,
          );

          // Pull request created with labels
          expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
            base: `release/${version}`,
            head: `cut/release/${candidateVersion}`,
            title: `chore(release): cut ${candidateVersion} release`,
            body: expect.any(String),
          });
          expect(createdPr.setLabels).toHaveBeenCalledExactlyOnceWith([
            "release: cut",
            `release-severity: minor`,
          ]);
        });
      },
    );
  });
});
