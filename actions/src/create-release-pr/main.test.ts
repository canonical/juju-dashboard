import { beforeEach, describe, it, vi } from "vitest";

import type { Ctx } from "@/lib";
import * as changelogMd from "@/lib/changelog-md";
import type * as ChangelogMdModule from "@/lib/changelog-md";
import { asyncIterable, mockPr } from "@/lib/test-utils";
import { parseVersion } from "@/lib/version";

import { bumpPackageVersion, run } from "./main";

vi.mock("@/lib/changelog-md", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof ChangelogMdModule;
  return {
    ...actual,
    readChangelog: vi.fn(),
    finalise: vi.fn(),
  };
});

const EMPTY_CHANGELOG = `# Changelog\n\n## Unreleased\n`;

const headCommit = (
  email = "some-user@example.com",
): { author: { email: string }; message: string } => ({
  author: { email },
  message: "a push",
});

function mockPullRequestsAssociatedWithCommit(
  headRef: null | string,
): () => Promise<{ data: unknown[] }> {
  return vi.fn().mockResolvedValue({
    data: headRef
      ? [{ state: "closed", merged_at: "2026-01-01T00:00:00Z", head: { ref: headRef } }]
      : [],
  });
}

describe("create-release-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    vi.clearAllMocks();
    ctx = {
      core: { info: vi.fn() },
      context: {
        refName: "release/1.0",
        sha: "push-sha",
        payload: { head_commit: headCommit() },
      },
      git: {
        mainBranch: "main",
        user: {
          name: "github-actions[bot]",
          email: "41898282+github-actions[bot]@users.noreply.github.com",
        },
        configUser: vi.fn(),
        checkout: vi.fn(),
        createBranch: vi.fn(),
        moveBranch: vi.fn(),
        commit: vi.fn(),
        push: vi.fn(),
        fetch: vi.fn(),
      },
      octokit: {
        rest: {
          repos: {
            listPullRequestsAssociatedWithCommit: vi
              .fn()
              .mockResolvedValue({ data: [] }),
          },
        },
      } as unknown as Ctx["octokit"],
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

    vi.mocked(changelogMd.readChangelog).mockResolvedValue(EMPTY_CHANGELOG);
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: [],
    });
  });

  it("creates the first beta PR when a placeholder version has no Unreleased entries", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.x" });
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: [],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.0-beta.0]\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.0-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0-beta.0",
      releaseVersion: "1.0.0-beta.0",
    });

    expect(ctx.repo.createPullRequest).toHaveBeenCalled();
  });

  it("creates the first beta PR when a placeholder version has Unreleased entries", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.x" });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- first feature\n`,
    );
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["first feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.0-beta.0]\n- first feature\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.0-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0-beta.0",
      releaseVersion: "1.0.0-beta.0",
    });

    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.0-beta.0",
      "release/1.0",
    );
    expect(ctx.git.checkout).toHaveBeenCalledTimes(2);
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, "release/1.0.0-beta.0");
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "release/1.0");
    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "1.0.0-beta.0"`,
      "./package.json",
    ]);
    expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
      "chore(release): prepare 1.0.0-beta.0",
      ["./package.json", "./CHANGELOG.md"],
    );
    expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
      head: "release/1.0.0-beta.0",
      base: "release/1.0",
      title: "Release 1.0.0-beta.0",
      body: expect.stringContaining("Merging this PR will publish 1.0.0-beta.0"),
    });
    expect(createdPr.update).not.toHaveBeenCalled();
  });

  it("creates the first beta PR when a stable version has Unreleased entries", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0" });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- first feature\n`,
    );
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["first feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.1-beta.0]\n- first feature\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.1-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.1-beta.0",
      releaseVersion: "1.0.1-beta.0",
    });

    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.1-beta.0",
      "release/1.0",
    );
    expect(ctx.git.checkout).toHaveBeenCalledTimes(2);
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, "release/1.0.1-beta.0");
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "release/1.0");
    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "1.0.1-beta.0"`,
      "./package.json",
    ]);
    expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
      "chore(release): prepare 1.0.1-beta.0",
      ["./package.json", "./CHANGELOG.md"],
    );
    expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
      head: "release/1.0.1-beta.0",
      base: "release/1.0",
      title: "Release 1.0.1-beta.0",
      body: expect.stringContaining("Merging this PR will publish 1.0.1-beta.0"),
    });
    expect(createdPr.update).not.toHaveBeenCalled();
  });

  it("creates a beta PR after a stable release", async ({ expect }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0" });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- new feature\n`,
    );
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["new feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.1-beta.0]\n- new feature\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.1-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.1-beta.0",
      releaseVersion: "1.0.1-beta.0",
    });

    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.1-beta.0",
      "release/1.0",
    );
    expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
      head: "release/1.0.1-beta.0",
      base: "release/1.0",
      title: "Release 1.0.1-beta.0",
      body: expect.any(String),
    });
  });

  it("creates a candidate PR after a beta release PR merges", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0-beta.0" });
    ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit =
      mockPullRequestsAssociatedWithCommit("release/1.0.0-beta.0") as unknown as typeof ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit;
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: [],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.0]\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0",
      releaseVersion: "1.0.0",
    });

    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.0",
      "release/1.0",
    );
    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "1.0.0"`,
      "./package.json",
    ]);
    expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
      head: "release/1.0.0",
      base: "release/1.0",
      title: "Release 1.0.0",
      body: expect.any(String),
    });
  });

  it("creates a beta PR when the push is the merge commit of a stable release PR", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0" });
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.1-beta.0]\n- feature\n`,
    });
    ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit =
      mockPullRequestsAssociatedWithCommit("release/1.0.0") as unknown as typeof ctx.octokit.rest.repos.listPullRequestsAssociatedWithCommit;
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.1-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.1-beta.0",
      releaseVersion: "1.0.1-beta.0",
    });
  });

  it("creates the next beta PR when Unreleased is empty after a beta release", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0-beta.0" });
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: [],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.0-beta.1]\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.0-beta.1" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0-beta.1",
      releaseVersion: "1.0.0-beta.1",
    });

    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.0-beta.1",
      "release/1.0",
    );
    expect(ctx.repo.createPullRequest).toHaveBeenCalled();
  });

  it("creates the next beta PR when changes land after a beta release", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0-beta.0" });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- new feature\n`,
    );
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["new feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.0-beta.1]\n- new feature\n`,
    });
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.0-beta.1" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0-beta.1",
      releaseVersion: "1.0.0-beta.1",
    });

    expect(ctx.git.createBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.0-beta.1",
      "release/1.0",
    );
    expect(ctx.repo.createPullRequest).toHaveBeenCalledExactlyOnceWith({
      head: "release/1.0.0-beta.1",
      base: "release/1.0",
      title: "Release 1.0.0-beta.1",
      body: expect.any(String),
    });
  });

  it("closes a stable PR when changes land after the beta release", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0-beta.0" });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- new feature\n`,
    );
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["new feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.0-beta.1]\n- new feature\n`,
    });
    const stablePr = {
      ...mockPr({ number: 111, head: "release/1.0.0" }),
      close: vi.fn(),
    };
    ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([stablePr]));
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.0-beta.1" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.0-beta.1",
      releaseVersion: "1.0.0-beta.1",
    });

    expect(stablePr.close).toHaveBeenCalled();
    expect(ctx.repo.createPullRequest).toHaveBeenCalled();
  });

  it("reuses an existing beta PR when the base branch changes", async ({
    expect,
  }) => {
    let callCount = 0;
    ctx.execOutput = vi.fn().mockImplementation(async () => {
      callCount += 1;
      return callCount === 1
        ? { stdout: "1.0.0" }
        : { stdout: "1.0.1-beta.0" };
    });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- new feature\n`,
    );
    const existingPr = {
      ...mockPr({ number: 222, head: "release/1.0.1-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.pullRequests = vi
      .fn()
      .mockReturnValue(asyncIterable([existingPr]));

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.1-beta.0",
      releaseVersion: "1.0.1-beta.0",
    });

    expect(ctx.git.createBranch).not.toHaveBeenCalled();
    expect(ctx.repo.createPullRequest).not.toHaveBeenCalled();
    expect(ctx.git.moveBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.1-beta.0",
      "release/1.0",
    );
    expect(ctx.git.checkout).toHaveBeenCalledTimes(2);
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(1, "release/1.0.1-beta.0");
    expect(ctx.git.checkout).toHaveBeenNthCalledWith(2, "release/1.0");
    expect(ctx.git.commit).not.toHaveBeenCalled();
    expect(ctx.exec).not.toHaveBeenCalled();
    expect(ctx.git.moveBranch).toHaveBeenCalledExactlyOnceWith(
      "release/1.0.1-beta.0",
      "release/1.0",
    );
    expect(ctx.git.push).toHaveBeenCalledExactlyOnceWith(
      { force: true },
      "release/1.0.1-beta.0",
    );
    expect(existingPr.update).toHaveBeenCalledExactlyOnceWith({
      body: expect.stringContaining("Merging this PR will publish 1.0.1-beta.0"),
    });
  });

  it("closes a stale release PR when the expected version changes", async ({
    expect,
  }) => {
    ctx.execOutput = vi.fn().mockResolvedValue({ stdout: "1.0.0" });
    vi.mocked(changelogMd.readChangelog).mockResolvedValue(
      `# Changelog\n\n## Unreleased\n- new feature\n`,
    );
    vi.mocked(changelogMd.finalise).mockResolvedValue({
      entryItems: ["new feature"],
      newContent: `# Changelog\n\n## Unreleased\n\n## [1.0.1-beta.0]\n- new feature\n`,
    });
    const stalePr = {
      ...mockPr({ number: 111, head: "release/1.0.0-beta.0" }),
      close: vi.fn(),
    };
    ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([stalePr]));
    const createdPr = {
      ...mockPr({ number: 222, head: "release/1.0.1-beta.0" }),
      update: vi.fn(),
    };
    ctx.repo.createPullRequest = vi.fn().mockResolvedValue(createdPr);

    await expect(run(ctx)).resolves.toStrictEqual({
      releasePrNumber: 222,
      releasePrHead: "release/1.0.1-beta.0",
      releaseVersion: "1.0.1-beta.0",
    });

    expect(stalePr.close).toHaveBeenCalled();
    expect(ctx.repo.createPullRequest).toHaveBeenCalled();
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
        ["missing \u0060beta\u0060 pre-release", "1.2.3"],
        ["\u0060alpha\u0060 pre-release", "1.2.3-alpha.0"],
      ] as const)("%s", ([version], { expect }) => {
        expect(() =>
          bumpPackageVersion(parseVersion(version), "candidate"),
        ).toThrow("Candidate versions can only be created from beta versions");
      });
    });
  });
});
