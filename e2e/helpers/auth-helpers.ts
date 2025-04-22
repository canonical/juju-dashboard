import { type Page } from "@playwright/test";

export class AuthHelpers {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async loginLocal(
    userName: string = process.env.USERNAME ?? "",
    password: string = process.env.PASSWORD ?? "",
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

  async login(userName?: string, password?: string) {
    if (process.env.AUTH_MODE === "candid") {
      return await this.loginCandid(userName, password);
    } else {
      await this.loginLocal(userName, password);
    }
  }
}
