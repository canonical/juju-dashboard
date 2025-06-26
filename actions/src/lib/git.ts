import * as exec from "@actions/exec";

export type ConfigScope = "global" | "system" | "local" | "worktree";

/**
 * Email and username for the Github Actions bot. Any commits from this user will show up as a bot
 * in Github's UI.
 *
 * @link https://api.github.com/users/github-actions%5Bbot%5D
 */
const GITHUB_ACTIONS_BOT = {
  email: "41898282+github-actions[bot]@users.noreply.github.com",
  name: "github-actions[bot]",
};

export default class Git {
  /**
   * User configuration.
   */
  public user = GITHUB_ACTIONS_BOT;

  /**
   * Name of the remote.
   */
  public origin = "origin";

  /**
   * Name of the main branch.
   */
  public mainBranch = "main";

  /**
   * Execute the provided git command.
   */
  public async exec(...args: string[]) {
    return exec.exec("git", args);
  }

  /**
   * Set a git config value.
   */
  public async config(
    key: string,
    value: string,
    scope: ConfigScope = "local",
  ) {
    return this.exec("config", `--${scope}`, key, value);
  }

  /**
   * Setup git to use the provided user.
   */
  async configUser() {
    await this.config("user.email", this.user.email);
    await this.config("user.name", this.user.name);
  }

  /**
   * Checkout the provided branch.
   */
  async checkout(branch: string) {
    await this.exec("checkout", branch);
  }

  /**
   * Create a new branch starting at `oldBranch`. If not provided, the main branch will be assumed.
   */
  async createBranch(name: string, oldBranch: string = this.mainBranch) {
    await this.exec("branch", "-c", oldBranch, name);
  }

  /**
   * Move a branch to point at a new target. Target can be a ref or a branch name.
   */
  async moveBranch(name: string, target: string) {
    await this.exec("branch", "--force", name, target);
  }

  /**
   * Stage and commit the specified files, with a commit message.
   */
  async commit(message: string, files: string[]) {
    await this.exec("commit", "-m", message, "--", ...files);
  }

  /**
   * Push the listed branches to the origin.
   */
  async push(
    options: { force?: boolean },
    ...branches: string[]
  ): Promise<void>;
  async push(...branches: string[]): Promise<void>;
  async push(
    maybeOptions: { force?: boolean } | string = {},
    ...branches: string[]
  ) {
    if (typeof maybeOptions === "string") {
      branches.unshift(maybeOptions);
      maybeOptions = {};
    }

    const flags = [];
    if (maybeOptions.force === true) {
      flags.push("--force");
    }

    await this.exec("push", ...flags, this.origin, ...branches);
  }
}
