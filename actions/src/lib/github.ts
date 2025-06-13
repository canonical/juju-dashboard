import type github from "@actions/github";
import type { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";

export type Octokit = ReturnType<typeof github.getOctokit>;
export type PullRequest = GetResponseDataTypeFromEndpointMethod<
  Octokit["rest"]["pulls"]["get"]
>;
