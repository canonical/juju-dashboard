/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { AuthHelpers } from "../helpers/auth-helpers";
import { ModelHelpers } from "../helpers/model-helpers";

type Fixtures = {
  authHelpers: AuthHelpers;
  modelHelpers: ModelHelpers;
};

export const test = base.extend<Fixtures>({
  authHelpers: async ({ page }, use) => {
    await use(new AuthHelpers(page));
  },
  modelHelpers: async ({ page }, use) => {
    await use(new ModelHelpers(page));
  },
});

export default test;
