import type { Browser, Page } from "@playwright/test";

import { getEnv, exec, findLine } from "../../../utils";

export type Secret = {
  username: string;
  password: string;
};

export const deviceCodeLogin = async (
  browser: Browser,
  user: Secret,
  codeRegex: RegExp,
  loginMethod: (page: Page, secret: Secret, code: string) => Promise<void>,
  loginArgs?: null | string,
): Promise<void> => {
  // Begin the login. The controller only needs to be registered the first
  // time (which is done when the workflow uses this function to log in to add
  // the controller).
  const loginProc = exec(
    `juju login ${loginArgs ?? ""} -c ${getEnv("CONTROLLER_NAME")}`,
  );
  if (!loginProc.child.stderr) {
    throw new Error("No output from login command.");
  }
  // Find the login line.
  const loginLine = await findLine(loginProc.child.stderr, (line) =>
    line.startsWith("Please visit"),
  );
  const loginURL = loginLine.match(/http\S+/)?.[0];
  const loginCode = loginLine.match(codeRegex)?.[0];
  if (!loginURL || !loginCode) {
    throw new Error("Login details not found.");
  }
  // Manually set the context to ignore HTTPS errors, for the case where this
  // function is called outside of the PlayWright runner to log in during the
  // workflow.
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(loginURL);
  await page.screenshot({ path: "login-before.png" });
  // Login with user credentials.
  try {
    await loginMethod(page, user, loginCode);
  } catch (error) {
    await page.screenshot({ path: "login-after.png" });
    throw error;
  }
  // Wait for the original process to finish.
  await loginProc;
  // Exit the browser so the script will finish when called outside of Playwright.
  await context.close();
};
