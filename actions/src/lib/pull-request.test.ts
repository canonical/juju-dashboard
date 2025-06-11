import { describe, it } from "vitest";

import { getPullRequestInfo } from "./pull-request";

import type { github } from "@/lib";

function mockPullRequest(labels: string[]): github.PullRequest {
  return {
    labels: labels.map((name) => ({ name })),
  } as github.PullRequest;
}

describe("getPullRequestInfo", () => {
  describe("produce versioning info", () => {
    it("patch pull request", ({ expect }) => {
      expect(
        getPullRequestInfo(mockPullRequest(["version: patch"])),
      ).toStrictEqual({
        version: "patch",
        changelog: false,
      });
    });

    it("minor pull request", ({ expect }) => {
      expect(
        getPullRequestInfo(mockPullRequest(["version: minor"])),
      ).toStrictEqual({
        version: "minor",
        changelog: false,
      });
    });

    it("major pull request", ({ expect }) => {
      expect(
        getPullRequestInfo(mockPullRequest(["version: major"])),
      ).toStrictEqual({
        version: "major",
        changelog: false,
      });
    });

    it("ignoring other labels", ({ expect }) => {
      expect(
        getPullRequestInfo(
          mockPullRequest([
            "version: patch",
            "changelog",
            "random label",
            "something else",
          ]),
        ),
      ).toStrictEqual({
        version: "patch",
        changelog: true,
      });
    });

    describe("with changelog", () => {
      it("patch pull request", ({ expect }) => {
        expect(
          getPullRequestInfo(mockPullRequest(["version: patch", "changelog"])),
        ).toStrictEqual({
          version: "patch",
          changelog: true,
        });
      });

      it("minor pull request", ({ expect }) => {
        expect(
          getPullRequestInfo(mockPullRequest(["version: minor", "changelog"])),
        ).toStrictEqual({
          version: "minor",
          changelog: true,
        });
      });

      it("major pull request", ({ expect }) => {
        expect(
          getPullRequestInfo(mockPullRequest(["version: major", "changelog"])),
        ).toStrictEqual({
          version: "major",
          changelog: true,
        });
      });
    });
  });

  describe("reject pull request", () => {
    it("with multiple version labels", ({ expect }) => {
      expect(() =>
        getPullRequestInfo(
          mockPullRequest(["version: major", "version: minor", "changelog"]),
        ),
      ).toThrow("pull request has multiple version labels.");
    });
  });

  describe("ignore pull request", () => {
    it("with no version label", ({ expect }) => {
      expect(getPullRequestInfo(mockPullRequest([]))).toBeNull();
    });

    it("with changelog label but no version label", ({ expect }) => {
      expect(getPullRequestInfo(mockPullRequest(["changelog"]))).toBeNull();
    });
  });
});
