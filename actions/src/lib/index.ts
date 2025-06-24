import * as core from "@actions/core";
import * as github from "@actions/github";
import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";

import Git from "./git";
import type { GithubPullRequest } from "./github";
import { Repository } from "./github";

export { default as Git } from "./git";
export * as changelog from "./changelog";
export * as github from "./github";
export * as util from "./util";
export * as versioning from "./versioning";

export type Ctx = {
  octokit: InstanceType<typeof GitHub>;
  context: Context;
  repo: Repository;
  git: Git;
  pr?: GithubPullRequest;
};

export async function createCtx(fallback?: {
  pullRequestInput: string;
}): Promise<Ctx> {
  // Configure octokit.
  const githubToken = core.getInput("github-token");
  const octokit = github.getOctokit(githubToken);

  // Fetch the repository that the action is running in.
  const repo = await Repository.get(octokit, github.context.repo);

  // Fetch the pull request that triggered the action, if available.
  let pr: GithubPullRequest | undefined = undefined;
  let prNumber = github.context.payload.pull_request?.number;

  if (prNumber === undefined && fallback?.pullRequestInput !== undefined) {
    // Try using fallback input.
    const inputPrNumber = Number(core.getInput(fallback.pullRequestInput));

    if (!isNaN(inputPrNumber)) {
      prNumber = inputPrNumber;
    }
  }

  if (prNumber !== undefined) {
    ({ data: pr } = await octokit.rest.pulls.get({
      repo: github.context.repo.repo,
      owner: github.context.repo.owner,
      pull_number: prNumber,
    }));
  }

  const git = new Git();
  await git.configUser();

  return {
    octokit,
    context: github.context,
    repo,
    git,
    pr,
  };
}
