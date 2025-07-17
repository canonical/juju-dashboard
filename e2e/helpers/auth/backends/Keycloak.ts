import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { chromium } from "playwright";

import { getEnv, exec, findLine, addFeatureFlags } from "../../../utils";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

import { LocalUser } from "./Local";
import { CreateOIDCUser } from "./OIDC";

type Secret = {
  username: string;
  password: string;
};

export class CreateKeycloakOIDCUser implements Action<KeycloakOIDCUser> {
  constructor(
    private username: string,
    private password: string,
    private identityUsername?: string,
    private identityPassword?: string,
  ) {
    this.username = username;
    this.password = password;
    this.identityUsername = identityUsername || username;
    this.identityPassword = identityPassword || password;
  }

  async run(jujuCLI: JujuCLI) {
    await jujuCLI.loginLocalCLIAdmin();
    // TODO: don't recreate the config if it already exists
    await exec('docker exec --user root keycloak sh -c "touch /kcadm.config"');
    await exec(
      'docker exec --user root keycloak sh -c "chown keycloak /kcadm.config"',
    );
    await exec(
      'docker exec keycloak sh -c "kcadm.sh config credentials --user jimm --password jimm --server http://0.0.0.0:8082/ --realm master --config /kcadm.config"',
    );
    await exec(
      `docker exec keycloak sh -c "kcadm.sh create users -s username=${this.identityUsername} -s enabled=true -s email=${this.identityUsername}@example.com -r jimm --config /kcadm.config"`,
    );
    await exec(
      `docker exec keycloak sh -c "kcadm.sh set-password -r jimm --username ${this.identityUsername} --new-password ${this.identityPassword} --config /kcadm.config"`,
    );
    console.log(`Keycloak OIDC user created: ${this.identityUsername}`);
  }

  async rollback(jujuCLI: JujuCLI) {
    await jujuCLI.loginLocalCLIAdmin();
    const user = this.result();
    const userId = await exec(
      `docker exec keycloak sh -c "kcadm.sh get users -q exact=true -q username=${user.identityUsername} -r jimm --config /kcadm.config" | yq .[0].id`,
    );
    await exec(
      `docker exec keycloak sh -c "kcadm.sh delete users/'${userId.stdout.trim()}' -r jimm --config /kcadm.config"`,
    );
    console.log(`Keycloak OIDC user deleted: ${user.identityUsername}`);
  }

  debug(): string {
    return `Create Keycloak OIDC user '${this.identityUsername}' (password '${this.identityPassword}')`;
  }

  result(): KeycloakOIDCUser {
    return new KeycloakOIDCUser(
      this.username,
      this.password,
      this.identityUsername,
      this.identityPassword,
    );
  }
}

export class KeycloakOIDCUser extends LocalUser {
  identityUsername: string;
  identityPassword: string;

  constructor(
    username: string,
    password: string,
    identityUsername?: string,
    identityPassword?: string,
  ) {
    super(username, password);
    this.identityUsername = identityUsername || username;
    this.identityPassword = identityPassword || password;
  }

  override async dashboardLogin(
    page: Page,
    url: string,
    expectError?: boolean,
  ) {
    await KeycloakOIDC.dashboardLogin(
      page,
      {
        username: this.dashboardUsername,
        password: this.identityPassword,
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
    // `cannot log into controller "jimm": connection is shut down`.
    while (retry-- > 0) {
      try {
        await KeycloakOIDC.loginCLI({
          username: this.identityUsername,
          password: this.identityPassword,
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
    return `${this.identityUsername}@example.com`;
  }

  override get dashboardUsername(): string {
    return this.identityUsername;
  }

  public get displayName(): string {
    return this.identityUsername;
  }

  public get email(): string {
    return `${this.identityUsername}@example.com`;
  }
}

export class KeycloakOIDC {
  static async loginCLI(user: Secret): Promise<void> {
    const loginProc = exec(`juju login -c ${getEnv("CONTROLLER_NAME")}`);
    if (!loginProc.child.stderr) {
      throw new Error("No output from login command.");
    }
    // Find the login line.
    const loginLine = await findLine(loginProc.child.stderr, (line) =>
      line.startsWith("Please visit"),
    );
    const loginURL = loginLine.match(/http\S+/)?.[0];
    const loginCode = loginLine.match(/(?<=enter code ).\w+-\w+/)?.[0];
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
    await KeycloakOIDC.uiLogin(page, user, loginCode);
    // Wait for the original process to finish.
    await loginProc;
    // Exit the browser so the script will finish when called outside of Playwright.
    await browser.close();
  }

  private static async uiLogin(page: Page, secret: Secret, code: string) {
    await page
      .getByRole("textbox", {
        name: "Enter the code provided by your device and click Submit",
      })
      .fill(code);
    await page.getByRole("button", { name: "Submit" }).click();
    await page
      .getByRole("textbox", { name: "Username or email" })
      .fill(secret.username);
    await page.getByRole("textbox", { name: "Password" }).fill(secret.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Yes" }).click();
    await expect(page.getByText("Device Login Successful")).toBeVisible();
  }

  static async dashboardLogin(
    page: Page,
    user: Secret,
    url: string,
    expectError?: boolean,
  ) {
    await page.goto(addFeatureFlags(url));
    await page.getByRole("link", { name: "Log in to the dashboard" }).click();
    await page
      .getByRole("textbox", { name: "Username or email" })
      .fill(user.username);
    await page.getByRole("textbox", { name: "Password" }).fill(user.password);
    await page.getByRole("button", { name: "Sign In" }).click();
    if (!expectError) {
      // Wait until the login flow redirects back to the dashboard so that the
      // cookies get set.
      await page.waitForURL("**/models");
      // The Keycloak OIDC flow always redirects back to /models so now we need to visit
      // the expected URL:
      await page.goto(addFeatureFlags(url));
    }
  }
}
