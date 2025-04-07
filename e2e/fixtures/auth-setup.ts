import { test as base } from "@playwright/test";

import { AuthHelpers } from "../helpers/auth-helpers";

type AuthFixtures = {
  authHelpers: AuthHelpers;
};

export const test = base.extend<AuthFixtures>({
  authHelpers: async ({ page }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(new AuthHelpers(page));
  },
});

export default test;
