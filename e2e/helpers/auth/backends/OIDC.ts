import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { getEnv, exec, addFeatureFlags } from "../../../utils";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

import { LocalUser } from "./Local";
import { deviceCodeLogin, Secret } from "./utils";

const IAM_DEVICE_CODE_REGEX = /(?<=enter code ).\w+/;

export class CreateOIDCUser implements Action<OIDCUser> {
  constructor(
    private username: string,
    private password: string,
  ) {}

  async run(jujuCLI: JujuCLI) {
    await jujuCLI.loginLocalCLIAdmin();
    await exec(`juju switch iam`);
    // Create the identity in Kratos.
    const userOutput =
      await exec(`curl $(juju show-unit kratos/0 | yq '.kratos/0.address'):4434/admin/identities --request POST -sL --header "Content-Type: application/json" --data '{
      "schema_id": "admin_v0",
      "traits": {
        "email": "${this.username}@example.com"
      }
    }' | yq .id`);
    const secretOutput = await exec(
      `juju add-secret password-secret-${this.username} password=${this.password}`,
    );
    await exec(`juju grant-secret password-secret-${this.username} kratos`);
    await exec(
      `juju run kratos/0 reset-password identity-id='${userOutput.stdout}' password-secret-id='${secretOutput.stdout}'`,
    );
    await exec(`juju remove-secret password-secret-${this.username}`);
    console.log(`OIDC user created: ${this.username}`);
  }

  async rollback(jujuCLI: JujuCLI) {
    await exec(`juju switch ${getEnv("JIMM_CONTROLLER_NAME")}:iam`);
    await jujuCLI.loginLocalCLIAdmin();
    const user = this.result();
    await exec(
      `juju run --format=json kratos/0 delete-identity email='${user.dashboardUsername}'`,
    );
    console.log(`OIDC user deleted: ${this.username}`);
  }

  debug(): string {
    return `Create OIDC user '${this.username}' (password '${this.password}')`;
  }
  result(): OIDCUser {
    return new OIDCUser(this.username, this.password);
  }
}

export class OIDCUser extends LocalUser {
  constructor(username: string, password: string) {
    super(username, password);
  }

  override async dashboardLogin(
    page: Page,
    url: string,
    expectError?: boolean,
  ) {
    await OIDC.dashboardLogin(
      page,
      {
        username: this.dashboardUsername,
        password: this.password,
      },
      url,
      expectError,
    );
  }

  override async reloadDashboard(page: Page) {
    await page.reload();
  }

  override async cliLogin() {
    let retry = 3;
    // This login is retried as sometimes the login fails if it is too slow and an error is displayed:
    // `cannot log into controller "jimm-k8s": connection is shut down`.
    while (retry-- > 0) {
      try {
        await OIDC.loginCLI({
          username: this.cliUsername,
          password: this.password,
        });
        return;
      } catch (error) {
        if (retry === 0) {
          throw error;
        }
      }
    }
  }

  override get cliUsername(): string {
    return `${this.username}@example.com`;
  }

  override get dashboardUsername(): string {
    return this.cliUsername;
  }

  public get displayName(): string {
    return this.username;
  }
}

export class OIDC {
  static async loginCLI(
    user: Secret,
    registerController = false,
  ): Promise<void> {
    await deviceCodeLogin(
      user,
      IAM_DEVICE_CODE_REGEX,
      OIDC.uiLogin,
      registerController ? "test-jimm.local:443" : null,
    );
  }

  private static async uiLogin(page: Page, secret: Secret, code: string) {
    await page.getByRole("textbox", { name: "XXXXXXXX" }).fill(code);
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill(secret.username);
    await page.getByRole("textbox", { name: /Password/ }).fill(secret.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Sign in successful")).toBeVisible();
  }

  static async dashboardLogin(
    page: Page,
    user: Secret,
    url: string,
    expectError?: boolean,
  ) {
    await page.goto(addFeatureFlags(url));
    await page.getByRole("link", { name: "Log in to the dashboard" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill(user.username);
    await page.getByRole("textbox", { name: "Password" }).fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    if (!expectError) {
      // Wait until the login flow redirects back to the dashboard so that the
      // cookies get set.
      await page.waitForURL("**/models");
      // The OIDC flow always redirects back to /models so now we need to visit
      // the expected URL:
      await page.goto(addFeatureFlags(url));
    }
  }
}
