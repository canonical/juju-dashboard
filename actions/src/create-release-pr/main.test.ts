import { describe, beforeEach, it, vi } from "vitest";

import { bumpPackageVersion, run } from "./main";

import { changelog, type Ctx } from "@/lib";
import { CHANGELOG_END_MARKER, CHANGELOG_START_MARKER } from "@/lib/changelog";
import type { PullRequest } from "@/lib/github";
import { CHANGELOG_LABEL } from "@/lib/labels";
import { asyncIterable, mockCutPr, mockPr } from "@/lib/test-utils";
import { parseVersion } from "@/lib/version";

describe("create-release-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    ctx = {
      context: {},
      pr: {},
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

  it.for([
    ["1.0.x", "1.0.0"],
    ["1.0.0", "1.0.1"],
    ["1.0.6", "1.0.7"],
    ["1.1.x", "1.1.0"],
    ["1.1.0", "1.1.1"],
    ["1.1.6", "1.1.7"],
  ] as const)(
    "creates beta release when cut PR merges (%s)",
    async ([packageVersion, version], { expect }) => {
      const headBranch = `release/${version}-beta.0`;

      ctx.context.refName = "release/1.0";
      ctx.pr = mockCutPr({
        number: 111,
        changelog: ["item a", "item b"],
      }) as PullRequest;
      const createdPr = {
        ...mockPr({
          number: 222,
          head: headBranch,
          body: changelog.generate("# Some header", []),
        }),
        update: vi.fn(),
      };
      ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);
      ctx.execOutput = vi.fn().mockResolvedValue({ stdout: packageVersion });

      await expect(run(ctx)).resolves.toStrictEqual({
        releasePrNumber: 222,
        releasePrHead: headBranch,
        releaseVersion: `${version}-beta.0`,
      });

      // Verify git operations.
      expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(headBranch);
      expect(ctx.git.checkout).toBeCalledTimes(2);
      expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, headBranch);
      expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "release/1.0");
      expect(ctx.git.commit).toHaveBeenCalledTimes(1);
      expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(headBranch);

      // Ensure package version was read and written.
      expect(ctx.execOutput).toHaveBeenCalledExactlyOnceWith("yq", [
        "-r",
        ".version",
        "./package.json",
      ]);
      expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
        "-i",
        `.version = "${version}-beta.0"`,
        "./package.json",
      ]);

      // Ensure created PR.
      expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
        head: headBranch,
        base: "release/1.0",
        title: `Release ${version}-beta.0`,
        body: expect.any(String),
      });

      expect(createdPr.update).toHaveBeenCalledExactlyOnceWith({
        body: expect.stringContaining("- item a\n- item b"),
      });
    },
  );

  it.for([
    [
      "with changelog label",
      [CHANGELOG_LABEL] as string[],
      `${CHANGELOG_START_MARKER}\n- my cool feature\n${CHANGELOG_END_MARKER}`,
    ],
    ["without changelog label", [] as string[], null],
  ] as const)(
    "creates beta release when feature merges, %s",
    async ([_, labels, body], { expect }) => {
      ctx.context.refName = "release/1.0";
      ctx.pr = mockPr({
        number: 111,
        title: "my cool feature",
        head: "feat/some-feature",
        labels,
      }) as PullRequest;
      const newReleasePr = {
        ...mockPr({
          number: 222,
          head: "release/1.0.0-beta.0",
          body: changelog.generate("# Some header", []),
        }),
        update: vi.fn(),
      };
      ctx.repo.createPullRequest = vi.fn().mockResolvedValue(newReleasePr);
      ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.x" });

      await expect(run(ctx)).resolves.toStrictEqual({
        releasePrNumber: 222,
        releasePrHead: "release/1.0.0-beta.0",
        releaseVersion: "1.0.0-beta.0",
      });

      // Verify git operations.
      expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
        "release/1.0.0-beta.0",
      );
      expect(ctx.git.checkout).toBeCalledTimes(2);
      expect(ctx.git.checkout).toHaveBeenNthCalledWith(
        1,
        "release/1.0.0-beta.0",
      );
      expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "release/1.0");
      expect(ctx.git.commit).toHaveBeenCalledTimes(1);
      expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
        "release/1.0.0-beta.0",
      );

      // Ensure package version was read and written.
      expect(ctx.execOutput).toHaveBeenCalledExactlyOnceWith("yq", [
        "-r",
        ".version",
        "./package.json",
      ]);
      expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
        "-i",
        `.version = "1.0.0-beta.0"`,
        "./package.json",
      ]);

      // Ensure created PR.
      expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
        head: "release/1.0.0-beta.0",
        base: "release/1.0",
        title: "Release 1.0.0-beta.0",
        body: expect.any(String),
      });

      if (body !== null) {
        expect(newReleasePr.update).toHaveBeenCalledExactlyOnceWith({
          body: expect.stringContaining(body),
        });
      } else {
        expect(newReleasePr.update).not.toHaveBeenCalled();
      }
    },
  );

  it("re-uses beta release when feature merges", async ({ expect }) => {
    ctx.context.refName = "release/1.0";
    ctx.pr = mockPr({
      number: 111,
      title: "my cool feature",
      head: "feat/some-feature",
      labels: [CHANGELOG_LABEL],
    }) as PullRequest;
    const EXISTING_RELEASE_PR = {
      ...mockPr({
        number: 222,
        head: "release/1.0.0-beta.0",
        body: changelog.generate("# Some header", ["item a", "item b"]),
      }),
      update: vi.fn(),
    };
    ctx.repo.pullRequests = vi
      .fn()
      .mockReturnValue(asyncIterable([EXISTING_RELEASE_PR]));

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0-beta.0",
      releaseVersion: "1.0.0-beta.0",
    });

    // Verify git operations.
    expect(ctx.git.createBranch).not.toHaveBeenCalled();
    expect(ctx.git.checkout).not.toHaveBeenCalled();
    expect(ctx.git.commit).not.toHaveBeenCalled();
    expect(ctx.git.push).not.toHaveBeenCalled();

    // Ensure package version was read and written.
    expect(ctx.execOutput).not.toHaveBeenCalled();
    expect(ctx.exec).not.toHaveBeenCalled();

    // Ensure created PR.
    expect(ctx.repo.createPullRequest).not.toHaveBeenCalled();
    expect(EXISTING_RELEASE_PR.update).toHaveBeenCalledExactlyOnceWith({
      body: expect.stringContaining("- item a\n- item b\n- my cool feature"),
    });
  });

  it("creates candidate release when beta merges", async ({ expect }) => {
    ctx.context.refName = "release/1.0";
    ctx.pr = mockPr({
      number: 111,
      title: "Release: 1.0.0-beta.0",
      head: "release/1.0.0-beta.0",
      body: changelog.generate("# Some header", ["item a", "item b", "item c"]),
    }) as PullRequest;
    const createdPr = {
      ...mockPr({
        number: 222,
        head: "release/1.0.0",
        body: changelog.generate("# Some header", []),
      }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0-beta.0" });

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0",
      releaseVersion: "1.0.0",
    });

    // Verify git operations.
    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.0",
    );
    expect(ctx.git.checkout).toBeCalledTimes(2);
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, "release/1.0.0");
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "release/1.0");
    expect(ctx.git.commit).toHaveBeenCalledTimes(1);
    expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith("release/1.0.0");

    // Ensure package version was read and written.
    expect(ctx.execOutput).toHaveBeenCalledExactlyOnceWith("yq", [
      "-r",
      ".version",
      "./package.json",
    ]);
    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "1.0.0"`,
      "./package.json",
    ]);

    // Ensure created PR.
    expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
      head: "release/1.0.0",
      base: "release/1.0",
      title: "Release 1.0.0",
      body: expect.any(String),
    });

    expect(createdPr.update).toHaveBeenCalledExactlyOnceWith({
      body: expect.stringContaining("- item a\n- item b\n- item c"),
    });
  });
});

describe("bumpPackageVersion", () => {
  describe("beta", () => {
    it.for([
      ["0.0.0", undefined, "0.0.1-beta.0"],
      ["0.0.0", "patch", "0.0.1-beta.0"],
      ["0.0.0", "minor", "0.1.0-beta.0"],
      ["0.0.0", "major", "1.0.0-beta.0"],
      ["0.0.1", "patch", "0.0.2-beta.0"],
      ["0.0.x", undefined, "0.0.0-beta.0"],
      ["1.2.3-beta.1", undefined, "1.2.3-beta.2"],
      ["1.2.3-beta.1", "patch", "1.2.3-beta.2"],
      ["1.2.3-beta.1", "minor", "1.2.3-beta.2"],
      ["1.2.3-beta.1", "major", "1.2.3-beta.2"],
    ] as const)(
      "%s (%s component)",
      ([version, versionComponent, expectedVersion], { expect }) => {
        expect(
          bumpPackageVersion(parseVersion(version), "beta", {
            versionComponent,
          }),
        ).toEqual(parseVersion(expectedVersion));
      },
    );
  });

  describe("candidate", () => {
    describe("valid", () => {
      it.for([
        ["1.2.3-beta.0", "1.2.3"],
        ["1.2.3-beta.1", "1.2.3"],
      ] as const)("%s", ([version, expectedVersion], { expect }) => {
        expect(bumpPackageVersion(parseVersion(version), "candidate")).toEqual(
          parseVersion(expectedVersion),
        );
      });
    });

    describe("invalid", () => {
      it.for([
        ["missing `beta` pre-release", "1.2.3"],
        ["`alpha` pre-release", "1.2.3-alpha.0"],
      ] as const)("%s", ([version], { expect }) => {
        expect(() =>
          bumpPackageVersion(parseVersion(version), "candidate"),
        ).toThrow("Candidate versions can only be created from beta versions");
      });
    });
  });
});
