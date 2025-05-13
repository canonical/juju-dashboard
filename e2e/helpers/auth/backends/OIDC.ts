import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { chromium } from "playwright";

import { getEnv, exec, findLine, addFeatureFlags } from "../../../utils";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

import { LocalUser } from "./Local";

type Secret = {
  username: string;
  password: string;
};

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
    // Begin the login. The controller only needs to be registered the first
    // time (which is done when the workflow uses this function to log in to add
    // the controller).
    const loginProc = exec(
      `juju login${registerController ? " test-jimm.local:443" : ""} -c ${getEnv("CONTROLLER_NAME")}`,
    );
    if (!loginProc.child.stderr) {
      throw new Error("No output from login command.");
    }
    // Find the login line.
    const loginLine = await findLine(loginProc.child.stderr, (line) =>
      line.startsWith("Please visit"),
    );
    const loginURL = loginLine.match(/http\S+/)?.[0];
    const loginCode = loginLine.match(/(?<=enter code ).\w+/)?.[0];
    if (!loginURL || !loginCode) {
      throw new Error("Login details not found.");
    }
    // Prepare a browser instance to go to the URL.
    const browser = await chromium.launch();
    // Manually set the context to ignore HTTPS errors, for the case where this
    // function is called outside of the PlayWright runner to log in during the
    // workflow.
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto(loginURL);
    // Login with user credentials.
    await OIDC.uiLogin(page, user, loginCode);
    // Wait for the original process to finish.
    await loginProc;
    // Exit the browser so the script will finish when called outside of Playwright.
    await browser.close();
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
