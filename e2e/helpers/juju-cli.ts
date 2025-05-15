import type { Browser } from "@playwright/test";

import { JujuEnv } from "../fixtures/setup";
import { CloudAccessType } from "../fixtures/setup";
import { getEnv, exec } from "../utils";

import type { Action } from "./action";
import type { User } from "./auth";
import { Users } from "./auth";
import { LocalUser } from "./auth/backends/Local";
import { Controller } from "./objects";

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
  private localAdmin: User;
  public identityAdmin: User;
  public controllerInstance: Controller;

  constructor(
    public jujuEnv: JujuEnv,
    public controller: string,
    public provider: string,
    browser: Browser,
  ) {
    this.users = new Users(browser);
    const { username, password } = LOCAL_CLI_ADMIN;
    // Create a Juju identity instance for the CLI admin.
    this.localAdmin = new LocalUser(username, password);
    // Create an identity instance for the admin user. When using local auth
    // this will be identical to this.localAdmin.
    this.identityAdmin = this.users.createUserInstance(username, password);
    this.controllerInstance = new Controller(
      // In JIMM the controller name given to Juju is "jimm".
      this.jujuEnv === JujuEnv.JIMM ? "jimm" : this.controller,
      this.identityAdmin,
    );
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
    if (this.jujuEnv === JujuEnv.JIMM) {
      // In JIMM the CLI admin is only available when in the JIMM controller.
      await exec(`juju switch ${getEnv("JIMM_CONTROLLER_NAME")}`);
    }
    await this.localAdmin.cliLogin();
  }

  /**
   * Login as the JIMM workload controller's OIDC identity. This will use the
   * credentials passed in via the environment.
   */
  async loginIdentityCLIAdmin(): Promise<void> {
    await this.identityAdmin.cliLogin();
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

    if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
      // Granting clouds must be done by the JIMM admin.
      await jujuCLI.loginIdentityCLIAdmin();
    } else {
      // Bootstrap must be done by the admin.
      await jujuCLI.loginLocalCLIAdmin();
    }

    if (jujuCLI.jujuEnv !== JujuEnv.JIMM) {
      // Grant access to the cloud.
      await exec(
        `juju grant-cloud '${user.cliUsername}' ${CloudAccessType.ADD_MODEL} ${jujuCLI.provider}`,
      );
    }

    // Login as the user.
    await user.cliLogin();

    // Use the client credentials for this user (stored in
    // ~/.local/share/juju/credentials.yaml). This allows authentication via the
    // oauth token which is required in some scenarios (e.g. adding secrets when
    // using microk8s).
    await exec(
      `juju update-credential ${jujuCLI.provider} ${jujuCLI.provider} -c '${jujuCLI.controller}'`,
    );
  }

  /**
   * Rollback this action, using the provided state from when the action was run.
   */
  async rollback(jujuCLI: JujuCLI) {
    const user = this.result();

    await user.cliLogin();

    // Remove the user's credential
    await exec(
      `juju remove-credential --force -c '${jujuCLI.controller}' '${jujuCLI.provider}' '${user.cliUsername}'`,
    );

    if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
      // Granting clouds must be done by the JIMM admin.
      await jujuCLI.loginIdentityCLIAdmin();
    } else {
      // Bootstrap must be done by the admin.
      await jujuCLI.loginLocalCLIAdmin();
    }

    if (jujuCLI.jujuEnv !== JujuEnv.JIMM) {
      // Remove the user's access to the cloud
      await exec(
        `juju revoke-cloud -c '${jujuCLI.controller}' ${user.cliUsername} ${CloudAccessType.ADD_MODEL} ${jujuCLI.provider}`,
      );
    }

    await this.userAction.rollback(jujuCLI);
  }

  result() {
    return this.userAction.result();
  }

  debug(): string {
    return `Bootstrapping user: ${this.userAction.debug()}`;
  }
}
