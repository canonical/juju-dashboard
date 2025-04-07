import { type Page } from "@playwright/test";

export class AuthHelpers {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async loginLocal() {
    await this.page.goto("/");
    await this.page.getByRole("textbox", { name: "Username" }).fill("admin");
    await this.page
      .getByRole("textbox", { name: "Password" })
      .fill("password1");
    await this.page
      .getByRole("button", { name: "Log in to the dashboard" })
      .click();
  }

  async loginCandid() {
    await this.page.goto("/");
    const popupPromise = this.page.waitForEvent("popup");
    await this.page
      .getByRole("link", { name: "Log in to the dashboard" })
      .click();
    const popup = await popupPromise;
    await popup.getByRole("link", { name: "static" }).click();
    await popup.getByRole("textbox", { name: "Username" }).fill("user1");
    await popup.getByRole("textbox", { name: "Password" }).fill("password1");
    await popup.getByRole("button", { name: "Login" }).click();
  }

  async login() {
    if (process.env.AUTH_MODE === "candid") {
      await this.loginCandid();
    } else {
      await this.loginLocal();
    }
  }
}
