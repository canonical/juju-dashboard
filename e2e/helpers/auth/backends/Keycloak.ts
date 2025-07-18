import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { chromium } from "playwright";

import { getEnv, exec, findLine, addFeatureFlags } from "../../../utils";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

import { LocalUser } from "./Local";
import { deviceCodeLogin, Secret } from "./utils";

export class CreateKeycloakOIDCUser implements Action<KeycloakOIDCUser> {
  constructor(
    private username: string,
    private password: string,
    private identityUsername?: string | null,
    private identityPassword?: string | null,
  ) {
    this.username = username;
    this.password = password;
    this.identityUsername = identityUsername || username;
    this.identityPassword = identityPassword || password;
  }

  async run(jujuCLI: JujuCLI) {
    console.error("NOT IMPLEMENTED");
  }

  async rollback(jujuCLI: JujuCLI) {
    console.error("NOT IMPLEMENTED");
  }

  debug(): string {
    return "NOT IMPLEMENTED";
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
    identityUsername?: string | null,
    identityPassword?: string | null,
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
}

export class KeycloakOIDC {
  static async loginCLI(user: Secret): Promise<void> {
    await deviceCodeLogin(
      user,
      /(?<=enter code ).\w+-\w+/,
      KeycloakOIDC.uiLogin,
    );
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
