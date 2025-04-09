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
    await this.page.goto("/");
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
    await this.page.goto("/");
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

  async login() {
    if (process.env.AUTH_MODE === "candid") {
      await this.loginCandid();
    } else {
      await this.loginLocal();
    }
  }

  async loginWithError(userName?: string, password?: string) {
    if (process.env.AUTH_MODE === "candid") {
      const popup = await this.loginCandid(userName, password);
      return popup.getByText(`authentication failed for user "${userName}"`);
    } else {
      await this.loginLocal(userName, password);
      return this.page.getByText("Could not log into controller");
    }
  }
}
