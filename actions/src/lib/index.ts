import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as github from "@actions/github";
import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";

import Git from "./git";
import { PullRequest, Repository } from "./github";

export { default as Git } from "./git";
export * as changelog from "./changelog";
export * as github from "./github";
export * as util from "./util";
export { default as branch } from "./branch";

export type Ctx = {
  octokit: InstanceType<typeof GitHub>;
  core: typeof core;
  context: Context & { refName: string };
  exec: typeof exec.exec;
  execOutput: typeof exec.getExecOutput;
  repo: Repository;
  git: Git;
  pr?: PullRequest;
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
  let pr: PullRequest | undefined = undefined;
  let prNumber = github.context.payload.pull_request?.number;

  if (prNumber === undefined && fallback?.pullRequestInput !== undefined) {
    // Try using fallback input.
    const inputPrNumber = Number(core.getInput(fallback.pullRequestInput));

    if (!isNaN(inputPrNumber)) {
      prNumber = inputPrNumber;
    }
  }

  if (prNumber !== undefined) {
    pr = await PullRequest.get(octokit, repo.identifier, prNumber);
  }

  const git = new Git();
  await git.configUser();

  return {
    octokit,
    core,
    context: Object.assign(
      { refName: process.env["GITHUB_REF_NAME"] ?? "" },
      github.context,
    ),
    exec: exec.exec,
    execOutput: exec.getExecOutput,
    repo,
    git,
    pr,
  };
}
