import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { chromium } from "playwright";

import { exec } from "../../../utils/exec";
import { findLine } from "../../../utils/findLine";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

import { LocalUser } from "./Local";

type Secret = {
  username: string;
  password: string;
};

// The name to use to identify the authenticated jimm controller. This can be
// anything, it does not need to match the real controller names.
const JIMM_CONTROLLER = "jimm-k8s";

export class CreateOidcUser implements Action<OidcUser> {
  constructor(
    private username: string,
    private password: string,
  ) {}

  async run(_jujuCLI: JujuCLI) {}
  async rollback(_jujuCLI: JujuCLI) {}

  debug(): string {
    return "mocked OIDC user";
  }
  result(): OidcUser {
    return new OidcUser(this.username, this.password);
  }
}

export class OidcUser extends LocalUser {
  constructor(username: string, password: string) {
    super(username, password);
  }

  override async dashboardLogin(page: Page) {
    await OIDC.dashboardLogin(page, {
      username: this.username,
      password: this.password,
    });
  }

  override async cliLogin() {
    // TODO: (WD-21779) Removing, as CLI will already be logged in
    // await OIDC.loginCLI({ username: this.username, password: this.password });
  }

  override get cliUsername(): string {
    return this.username;
  }

  override get dashboardUsername(): string {
    return this.username;
  }
}

export class OIDC {
  static async loginCLI(user: Secret): Promise<void> {
    try {
      await exec(`juju unregister ${JIMM_CONTROLLER} --no-prompt`);
      console.log(`Unregistered ${JIMM_CONTROLLER}.`);
    } catch (error) {
      console.log("Not currently logged in.");
    }
    // Begin the login.
    const loginProc = exec(
      `juju login test-jimm.local:443 -c ${JIMM_CONTROLLER}`,
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

  static async dashboardLogin(page: Page, user: Secret) {
    await page.getByRole("link", { name: "Log in to the dashboard" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill(user.username);
    await page.getByRole("textbox", { name: "Password" }).fill(user.password);
    await page.getByRole("button", { name: "Sign in" }).click();
  }
}
