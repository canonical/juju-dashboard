import { describe, beforeEach, it, vi } from "vitest";

import { run } from "./main";

import type { Ctx } from "@/lib";
import { CHANGELOG_END_MARKER, CHANGELOG_START_MARKER } from "@/lib/changelog";

async function* asyncIterable<T>(items: T[]) {
  yield* items;
}

const MINOR_RELEASE_PR = {
  number: 123,
  base: "release/1.2",
  head: "cut/release/1.2",
  labels: [{ name: "release: cut" }, { name: "release-severity: minor" }],
  body: `\n${CHANGELOG_START_MARKER}\n${CHANGELOG_END_MARKER}\n`,
};
const FEATURE_PR = {
  number: 999,
  base: "main",
  head: "feat/my-feature",
  labels: [{ name: "Review: Code" }, { name: "changelog" }],
};

describe("cut-release-pr", () => {
  let ctx: Ctx;

  beforeEach(() => {
    ctx = {
      git: {
        mainBranch: "main",
        configUser: vi.fn(),
        checkout: vi.fn(),
        createBranch: vi.fn(),
        moveBranch: vi.fn(),
        commit: vi.fn(),
        push: vi.fn(),
      },
      repo: {
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
    } as unknown as Ctx;
  });

  it("use existing release branch", async ({ expect }) => {
    ctx.repo.pullRequests = vi
      .fn()
      .mockReturnValue(asyncIterable([MINOR_RELEASE_PR, FEATURE_PR]));

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
    ctx.repo.pullRequests = vi.fn().mockReturnValue(asyncIterable([]));

    const createdPr = {
      number: 123,
      base: "release/1.2",
      head: "cut/release/1.2",
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
      undefined,
    );
    expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
      2,
      "cut/release/1.2",
      undefined,
    );

    // Update package.json version
    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "1.2.0"`,
      "./package.json",
    ]);

    // Commit change
    expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
      "update package.json version to 1.2.0",
      ["./package.json"],
    );

    // Push new branches
    expect(ctx.git.push).toHaveBeenNthCalledWith(
      1,
      "release/1.2",
      "cut/release/1.2",
    );

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

  it("upgrade existing PR", async ({ expect }) => {
    const existingPr = { ...MINOR_RELEASE_PR, close: vi.fn() };
    ctx.repo.pullRequests = vi
      .fn()
      .mockReturnValue(asyncIterable([existingPr, FEATURE_PR]));

    const createdPr = {
      number: 543,
      base: "release/2.0",
      head: "cut/release/2.0",
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
      undefined,
    );
    expect(ctx.git.createBranch).toHaveBeenNthCalledWith(
      2,
      "cut/release/2.0",
      undefined,
    );

    // Update package.json version
    expect(ctx.exec).toHaveBeenCalledExactlyOnceWith("yq", [
      "-i",
      `.version = "2.0.0"`,
      "./package.json",
    ]);

    // Commit change
    expect(ctx.git.commit).toHaveBeenCalledExactlyOnceWith(
      "update package.json version to 2.0.0",
      ["./package.json"],
    );

    // Push new branches
    expect(ctx.git.push).toHaveBeenNthCalledWith(
      1,
      "release/2.0",
      "cut/release/2.0",
    );

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
      2,
      { force: true },
      "release/2.0",
    );
  });
});
