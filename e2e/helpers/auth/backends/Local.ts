import type { Browser, Page } from "@playwright/test";

import type { User } from "..";
import { addFeatureFlags, juju } from "../../../utils";
import { exec } from "../../../utils/exec";
import type { Action } from "../../action";
import type { JujuCLI } from "../../juju-cli";

export class CreateLocalUser implements Action<LocalUser> {
  constructor(
    private username: string,
    private password: string,
  ) {}

  result(): LocalUser {
    return new LocalUser(this.username, this.password);
  }

  async run(jujuCLI: JujuCLI) {
    await jujuCLI.loginLocalCLIAdmin();
    await exec(
      `juju add-user --controller '${jujuCLI.controller}' '${this.username}'`,
    );
    await exec(
      `{ echo ${this.password}; echo ${this.password}; } | juju change-user-password '${this.username}'`,
    );
  }

  async rollback(jujuCLI: JujuCLI) {
    await jujuCLI.loginLocalCLIAdmin();
    await exec(
      `juju remove-user --yes --quiet --controller '${jujuCLI.controller}' '${this.username}'`,
    );
  }

  debug(): string {
    return `Create local user '${this.username}' (password '${this.password}')`;
  }
}

export class LocalUser implements User {
  constructor(
    public username: string,
    public password: string,
  ) {}

  private async enterCredentials(page: Page) {
    await page.getByRole("textbox", { name: "Username" }).fill(this.username);
    await page.getByRole("textbox", { name: "Password" }).fill(this.password);
    await page.getByRole("button", { name: "Log in to the dashboard" }).click();
  }

  async dashboardLogin(page: Page, url: string) {
    await page.goto(addFeatureFlags(url));
    await this.enterCredentials(page);
  }

  async reloadDashboard(page: Page) {
    await page.reload();
    await this.enterCredentials(page);
  }

  async cliLogin(_browser: Browser) {
    await juju.login(this.cliUsername, this.password);
  }

  public get cliUsername(): string {
    return this.username;
  }

  public get dashboardUsername(): string {
    return this.username;
  }

  public get displayName(): string {
    return this.dashboardUsername;
  }
}
