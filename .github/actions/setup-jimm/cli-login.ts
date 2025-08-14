import { chromium } from "@playwright/test";
import { OIDC } from "../../../e2e/helpers/auth/backends";

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
if (!username || !password) {
  throw new Error(
    `Did not receive all environment variables, got username: "${username}", password: "${password}".`,
  );
}
console.log("Logging in to JIMM.");
// Prepare a browser instance to go to the URL.
const browser = await chromium.launch();
await OIDC.loginCLI(
  browser,
  {
    username,
    password,
  },
  // Register the controller.
  true,
);
browser.close();
console.log("Logged in.");
