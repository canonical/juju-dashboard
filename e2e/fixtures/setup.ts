/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { AuthHelpers } from "../helpers/auth-helpers";

type Fixtures = {
  authHelpers: AuthHelpers;
};

export const test = base.extend<Fixtures>({
  authHelpers: async ({ page }, use) => {
    await use(new AuthHelpers(page));
  },
});

export default test;
