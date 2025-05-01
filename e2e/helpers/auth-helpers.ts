import { type Page } from "@playwright/test";

import { type TestOptions } from "../fixtures/setup";

export class AuthHelpers {
  readonly page: Page;
  readonly admin: {
    name: string;
    password: string;
  };
  constructor(page: Page, testOptions: TestOptions) {
    this.page = page;
    this.admin = testOptions.admin;
  }

  async loginLocal(
    userName: string = this.admin.name,
    password: string = this.admin.password,
  ) {
    await this.page.getByRole("textbox", { name: "Username" }).fill(userName);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page
      .getByRole("button", { name: "Log in to the dashboard" })
      .click();
  }

  async loginCandid(
    userName: string = "user1",
    password: string = "password1",
  ) {
    const popupPromise = this.page.waitForEvent("popup");
    await this.page
      .getByRole("link", { name: "Log in to the dashboard" })
      .click();
    const popup = await popupPromise;
    await popup.getByRole("link", { name: "static" }).click();
    await popup.getByRole("textbox", { name: "Username" }).fill(userName);
    await popup.getByRole("textbox", { name: "Password" }).fill(password);
    await popup.getByRole("button", { name: "Login" }).click();
    return popup;
  }

  async loginOIDC(
    userName: string = "test@example.com",
    password: string = "test",
  ) {
    await this.page
      .getByRole("link", { name: "Log in to the dashboard" })
      .click();
    await this.page.getByRole("textbox", { name: "Email" }).fill(userName);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page.getByRole("button", { name: "Sign in" }).click();
    return this.page;
  }

  async login(userName?: string, password?: string) {
    if (process.env.AUTH_MODE === "candid") {
      return await this.loginCandid(userName, password);
    } else if (process.env.AUTH_MODE === "oidc") {
      return await this.loginOIDC(userName, password);
    } else {
      await this.loginLocal(userName, password);
    }
  }
}
