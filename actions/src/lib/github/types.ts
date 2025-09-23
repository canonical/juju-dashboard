import type github from "@actions/github";
import type {
  GetResponseDataTypeFromEndpointMethod,
  RequestInterface,
} from "@octokit/types";

/**
 * Octokit interface for interfacing with GitHub API.
 */
export type Octokit = ReturnType<typeof github.getOctokit>;

/**
 * Pull request on GitHub.
 *
 * @note The GitHub API doesn't return a consistent representation across all endpoints (eg. list
 * vs get). For ease of use, this type is defined as a subset of all available fields, so that
 * responses from multiple APIs can be used directly.
 */
export type GithubPullRequest = Pick<
  GetResponseDataTypeFromEndpointMethod<Octokit["rest"]["pulls"]["get"]>,
  | "base"
  | "body"
  | "head"
  | "id"
  | "labels"
  | "number"
  | "state"
  | "title"
  | "url"
  | "user"
>;

/**
 * Common identifier for a repository. Equivalent to `owner/repo`.
 */
export type RepositoryIdentifier = { repo: string; owner: string };

/**
 * GitHub repository.
 */
export type GithubRepository = GetResponseDataTypeFromEndpointMethod<
  Octokit["rest"]["repos"]["get"]
>;

/**
 * Utility type for fetching parameters for an Octokit request.
 */
export type RequestParameters<T extends RequestInterface> = Partial<
  Parameters<T>[0]
>;
