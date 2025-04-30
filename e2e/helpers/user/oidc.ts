import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { chromium } from "playwright";

import { exec } from "../../utils/exec";
import { findLine } from "../../utils/findLine";

type Secret = {
  username: string;
  password: string;
};

// The name to use to identify the authenticated jimm controller. This can be
// anything, it does not need to match the real controller names.
const JIMM_CONTROLLER = "jimm-k8s";

export class OIDC {
  static async loginCli(user: Secret): Promise<void> {
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
}
