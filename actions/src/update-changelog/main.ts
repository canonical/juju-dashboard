import core from "@actions/core";
import github from "@actions/github";

import { getReleaseBranchInfo } from "@/lib/branch";
import { getPullRequestInfo } from "@/lib/pull-request";

export async function run() {
  // Configure octokit.
  const githubToken = core.getInput("github-token");
  const octokit = github.getOctokit(githubToken);

  // Pull inputs.
  const mergedPullRequest = Number(
    core.getInput("merged-pull-request", {
      required: true,
      trimWhitespace: true,
    }),
  );
  if (isNaN(mergedPullRequest)) {
    throw new Error("invalid input: `merged-pull-request`");
  }

  // Fetch the pull request.
  const { data: pullRequest } = await octokit.rest.pulls.get({
    repo: github.context.repo.repo,
    owner: github.context.repo.owner,
    // TODO: Should this be passed as an input, or use the PR which this action is triggered against?
    pull_number: mergedPullRequest,
  });

  // Determine the severity of the PR.
  const _prInfo = getPullRequestInfo(pullRequest);

  // Determine if the pull request target is correct for the change type.
  const targetBranch = pullRequest.base.ref;
  const isDefaultBranch = targetBranch === pullRequest.base.repo.default_branch;
  const releaseInfo = getReleaseBranchInfo(targetBranch);
  if (!isDefaultBranch && releaseInfo === null) {
    throw new Error("invalid PR target :(");
  }

  if (isDefaultBranch) {
    // TODO: Update changelog for main branch
  } else {
    // TODO: Update changelog for release branch
  }
}
