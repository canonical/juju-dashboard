import { execSync } from "child_process";

import { type Page } from "@playwright/test";

export class ModelHelpers {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async addModel(modelName: string) {
    execSync(`juju add-model ${modelName}`).toString();
  }
}
