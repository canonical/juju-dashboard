import type { Browser } from "@playwright/test";
import { type Page } from "@playwright/test";

import { exec } from "../../../utils/exec";
import { findLine } from "../../../utils/findLine";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

import { LocalUser } from "./Local";

const CONFIG_PATH = "/var/snap/candid/current/config.yaml";

export class CreateCandidUser implements Action<CandidUser> {
  private static browser: Browser;

  constructor(
    private username: string,
    private password: string,
  ) {}

  public static prepare(browser: Browser) {
    CreateCandidUser.browser = browser;
  }

  result(): CandidUser {
    return new CandidUser(
      this.username,
      this.password,
      CreateCandidUser.browser,
    );
  }

  async run(jujuCLI: JujuCLI) {
    const candidConfig = await getCandidConfig();

    // Extract users already in the config
    const staticUsers = getStaticUsers(candidConfig);

    // Add the user to the config, and restart Candid.
    staticUsers[this.username] = {
      name: `User '${this.username}'`,
      email: `${this.username}@example.com`,
      password: this.password,
      groups: [],
    };
    await setCandidConfig(candidConfig);
    console.log(`Candid user created: ${this.username}`);

    await jujuCLI.loginLocalCLIAdmin();

    // Ensure the user has the correct grant to allow them to login.
    const user = this.result();
    await exec(`juju grant '${user.cliUsername}' 'login'`);
  }

  async rollback(jujuCLI: JujuCLI) {
    await jujuCLI.loginLocalCLIAdmin();

    // Revoke the user's grant.
    const user = this.result();
    await exec(`juju revoke '${user.cliUsername}' 'login'`);

    // Remove the user from Candid.
    const candidConfig = await getCandidConfig();

    // Extract users already in the config
    const staticUsers = getStaticUsers(candidConfig);

    // Remove the user from the config, and restart Candid.
    delete staticUsers[this.username];
    await setCandidConfig(candidConfig);
    console.log(`Candid user deleted: ${this.username}`);
  }

  debug(): string {
    return `Create Candid user '${this.username}' (password '${this.password}')`;
  }
}

export class CandidUser extends LocalUser {
  constructor(
    username: string,
    password: string,
    private browser: Browser,
  ) {
    super(username, password);
  }

  override async dashboardLogin(page: Page, url: string) {
    await page.goto(url);
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Log in to the dashboard" }).click();

    const popup = await popupPromise;
    await this.candidUiLogin(popup);
  }

  override async cliLogin() {
    await exec("juju logout");

    // Begin the login
    const loginProc = exec("juju login");

    if (!loginProc.child.stderr) {
      throw new Error("couldn't capture stderr when fetching login URL");
    }

    // Find the login URL
    const loginUrl = await findLine(
      loginProc.child.stderr,
      (line, allLines) => {
        return (
          allLines.at(-2) === "If it does not open, please open this URL:" &&
          line.startsWith("http")
        );
      },
    );

    // Prepare a browser instance to go to the URL
    const context = await this.browser.newContext();
    const page = await context.newPage();
    await page.goto(loginUrl);

    // Login with user credentials
    await this.candidUiLogin(page);

    // Wait for the original process to finish.
    await loginProc;

    await context.close();
  }

  override get cliUsername(): string {
    return `${this.username}@external`;
  }

  async candidUiLogin(page: Page) {
    await page.getByRole("link", { name: "static" }).click();
    await page.getByRole("textbox", { name: "Username" }).fill(this.username);
    await page.getByRole("textbox", { name: "Password" }).fill(this.password);
    await page.getByRole("button", { name: "Login" }).click();
  }
}

type CandidConfig = {
  "identity-providers": {
    type: string;
    users: CandidConfigUsers;
  }[];
};

type CandidConfigUsers = Record<
  string,
  { name: string; email: string; password: string; groups: string[] }
>;

async function getCandidConfig(): Promise<CandidConfig> {
  return JSON.parse((await exec(`yq -oj '${CONFIG_PATH}'`)).stdout);
}

async function setCandidConfig(config: CandidConfig): Promise<void> {
  // Write the config
  const writeCommand = `yq -P -oy  <<- EOF | sudo tee '${CONFIG_PATH}'
      ${JSON.stringify(config)}
      EOF`;
  await exec(writeCommand);

  await restartCandid();
}

function getStaticUsers(candidConfig: CandidConfig): CandidConfigUsers {
  const identityProviders = candidConfig["identity-providers"] ?? [];
  const staticProvider = identityProviders.find(
    (provider) => provider.type === "static",
  );

  if (!staticProvider) {
    throw new Error("Candid static provider must be configured");
  }

  return staticProvider.users;
}

async function restartCandid(): Promise<void> {
  await exec("sudo snap restart candid");
  while (true) {
    const output = await exec("snap changes candid");
    const inProgress = output.stdout
      .trim()
      // Pull out each line
      .split("\n")
      // Skip header
      .slice(1)
      // Find changes that are in progress
      .filter((line) => line.includes("Doing")).length;

    if (inProgress === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      break;
    }

    console.log(`Waiting for candid restart: ${inProgress}`);
  }
}
