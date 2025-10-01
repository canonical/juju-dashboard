import type {
  GithubPullRequest,
  Octokit,
  RepositoryIdentifier,
  RequestParameters,
} from "./types";

export class PullRequest {
  /**
   * This is the identifier used by Octokit for pull request adjacent requests.
   */
  private identifier: {
    // NOTE: Octokit expects snake case for the pull request number.
    pull_number: number;
  } & RepositoryIdentifier;

  constructor(
    private octokit: Octokit,
    repository: RepositoryIdentifier,
    public pullRequest: GithubPullRequest,
  ) {
    this.identifier = {
      ...repository,
      pull_number: pullRequest.number,
    };
  }

  public get number(): GithubPullRequest["number"] {
    return this.pullRequest.number;
  }

  public get title(): GithubPullRequest["title"] {
    return this.pullRequest.title;
  }

  public get body(): GithubPullRequest["body"] {
    return this.pullRequest.body;
  }

  public get labels(): GithubPullRequest["labels"] {
    return this.pullRequest.labels;
  }

  public get head(): GithubPullRequest["head"]["ref"] {
    return this.pullRequest.head.ref;
  }

  public get base(): GithubPullRequest["base"]["ref"] {
    return this.pullRequest.base.ref;
  }

  /**
   * Generate the changelog entry for this pull request.
   */
  public changelogEntry(): string {
    return `${this.title} by @${this.pullRequest.user.login} (#${this.number})`;
  }

  public async close(): Promise<void> {
    await this.update({
      state: "closed",
    });
  }

  public async setLabels(labels: string[]): Promise<void> {
    const { data: newLabels } = await this.octokit.rest.issues.setLabels({
      repo: this.identifier.repo,
      owner: this.identifier.owner,
      issue_number: this.identifier.pull_number,

      labels,
    });

    // Manually update the labels, instead of re-fetching.
    this.pullRequest.labels = newLabels;
  }

  public hasLabel(label: string): boolean {
    return this.labels.find(({ name }) => name === label) !== undefined;
  }

  public async update(
    params: RequestParameters<Octokit["rest"]["pulls"]["update"]>,
  ): Promise<void> {
    const { data: pullRequest } = await this.octokit.rest.pulls.update({
      ...this.identifier,
      ...params,
    });

    this.pullRequest = pullRequest;
  }

  /**
   * Fetch a repository using `owner/repo`.
   */
  public static async get(
    octokit: Octokit,
    repository: RepositoryIdentifier,
    number: number,
  ): Promise<PullRequest> {
    const { data: pullRequest } = await octokit.rest.pulls.get({
      ...repository,
      pull_number: number,
    });
    return new PullRequest(octokit, repository, pullRequest);
  }
}
