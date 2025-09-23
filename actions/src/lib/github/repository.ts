import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";

import { PullRequest } from "./pull-request";
import type {
  GithubPullRequest,
  GithubRepository,
  Octokit,
  RepositoryIdentifier,
  RequestParameters,
} from "./types";

export class Repository {
  /**
   * Identifier components for the repository, corresponding to `owner/repo`.
   */
  public identifier: RepositoryIdentifier;

  constructor(
    private octokit: Octokit,
    public repo: GithubRepository,
  ) {
    this.identifier = { repo: repo.name, owner: repo.owner.login };
  }

  /**
   * Fetch all branches on this repository, and return them as an async iterator.
   */
  public async *branches(
    params: RequestParameters<Octokit["rest"]["repos"]["listBranches"]> = {},
  ): AsyncGenerator<
    RestEndpointMethodTypes["repos"]["listBranches"]["response"]["data"][0],
    void,
    unknown
  > {
    const iter = this.octokit.paginate.iterator(
      this.octokit.rest.repos.listBranches,
      {
        ...this.identifier,
        ...params,
      },
    );

    for await (const { data: branches } of iter) {
      yield* branches;
    }
  }

  /**
   * Fetch all pull requests for this repository, and produce them in an async iterator.
   */
  public async *pullRequests(
    params: RequestParameters<Octokit["rest"]["pulls"]["list"]> = {},
  ): AsyncGenerator<PullRequest> {
    const iter = this.octokit.paginate.iterator(this.octokit.rest.pulls.list, {
      ...this.identifier,
      ...params,
    });

    for await (const { data: pullRequests } of iter) {
      for (const pullRequest of pullRequests) {
        yield new PullRequest(
          this.octokit,
          this.identifier,
          pullRequest as GithubPullRequest,
        );
      }
    }
  }

  /**
   * Create a new pull request in this repository.
   */
  public async createPullRequest(
    params: {
      head: string;
      base: string;
    } & RequestParameters<Octokit["rest"]["pulls"]["create"]>,
  ): Promise<PullRequest> {
    const { data: pullRequest } = await this.octokit.rest.pulls.create({
      ...this.identifier,
      ...params,
    });
    return new PullRequest(this.octokit, this.identifier, pullRequest);
  }

  /**
   * Return the default branch name configured for this repository.
   */
  public get defaultBranch(): string {
    return this.repo.default_branch;
  }

  /**
   * Fetch a repository using `owner/repo`.
   */
  public static async get(
    octokit: Octokit,
    identifier: RepositoryIdentifier,
  ): Promise<Repository> {
    const { data: fetchedRepo } = await octokit.rest.repos.get(identifier);
    return new Repository(octokit, fetchedRepo);
  }
}
