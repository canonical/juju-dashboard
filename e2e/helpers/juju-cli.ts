import fs from "node:fs/promises";

import type { Browser } from "@playwright/test";

import { CloudAccessType } from "../fixtures/setup";
import { juju, getEnv, exec } from "../utils";

import type { Action } from "./action";
import type { User } from "./auth";
import { Users } from "./auth";

/**
 * Credentials for the local superuser.
 */
const LOCAL_CLI_ADMIN = {
  username: getEnv("ADMIN_USERNAME"),
  password: getEnv("ADMIN_PASSWORD"),
};

/**
 * Wraps interactions with to the Juju CLI.
 */
export class JujuCLI {
  /**
   * Auth backend that is currently in use.
   */
  private users: Users;

  constructor(
    public controller: string,
    public provider: string,
    browser: Browser,
  ) {
    this.users = new Users(browser);
  }

  /**
   * Produce an action that will create a new 'standard' user.
   *
   * This will be a new user that will have the following permissions:
   *
   * - Login to CLI
   *
   * - `add-model` permissions to default cloud
   *
   * - Credential added to the controller
   */
  public createUser(): Action<User> {
    const userAction = this.users.createUser();
    return new BootstrapAction(userAction);
  }

  /**
   * Create a fake user.
   *
   * This user will only exist within the test process, it will not be sent to the auth backend.
   * This is suitable for performing login actions with the CLI/dashboard using the logic of the
   * auth provider.
   */
  public fakeUser(username: string, password: string): User {
    return this.users.createUserInstance(username, password);
  }

  /**
   * Login as the local controller's superuser. This will use the credentials passed in via the
   * environment.
   *
   * @note This user won't necessarily be present in the auth backend, so don't try use it within
   * tests. This is primarily intended to assist with forceful clean-up.
   */
  async loginLocalCLIAdmin(): Promise<void> {
    // TODO: (WD-21779) Temporary until OIDC is properly implemented
    if (process.env["AUTH_MODE"] === "oidc") {
      return;
    }

    const { username, password } = LOCAL_CLI_ADMIN;
    await juju.login(username, password);
  }
}

/**
 * Encapsulates common logic required to bring a user up to a base-level set of permissions (able
 * to manage their own models, access the cloud, etc.
 *
 * This is additional logic on top of backend-specific logic from each auth provider, so this
 * action wraps an existing action which produces a user. The bootstrap will operate on the user
 * provided by the inner action _after_ the corresponding run/rollback methods have completed.
 */
class BootstrapAction implements Action<User> {
  constructor(private userAction: Action<User>) {}

  async run(jujuCLI: JujuCLI) {
    await this.userAction.run(jujuCLI);

    const user = this.result();

    // Bootstrap must be done by the admin.
    await jujuCLI.loginLocalCLIAdmin();

    // Grant access to the cloud.
    await exec(
      `juju grant-cloud '${user.cliUsername}' ${CloudAccessType.ADD_MODEL} ${jujuCLI.provider}`,
    );

    // Login as the user.
    await user.cliLogin();

    // Add the user's credential to the controller.
    const credential = await user.getCredential();
    const tmpFilePath = `e2e/helpers/juju-cred-${Date.now()}.yaml`;
    await fs.writeFile(tmpFilePath, credential, "utf8");
    await exec(
      `juju add-credential ${jujuCLI.provider} -f ${tmpFilePath} -c '${jujuCLI.controller}'`,
    );
    await fs.unlink(tmpFilePath);
  }

  /**
   * Rollback this action, using the provided state from when the action was run.
   */
  async rollback(jujuCLI: JujuCLI) {
    const user = this.result();

    await user.cliLogin();

    // Remove the user's credential
    await exec(
      `juju remove-credential --force -c '${jujuCLI.controller}' '${jujuCLI.provider}' '${user.cliUsername}' `,
    );

    await jujuCLI.loginLocalCLIAdmin();

    // Remove the user's access to the cloud
    await exec(
      `juju revoke-cloud -c '${jujuCLI.controller}' ${user.cliUsername} ${CloudAccessType.ADD_MODEL} ${jujuCLI.provider}`,
    );

    await this.userAction.rollback(jujuCLI);
  }

  result() {
    return this.userAction.result();
  }

  debug(): string {
    return `Bootstrapping user: ${this.userAction.debug()}`;
  }
}
