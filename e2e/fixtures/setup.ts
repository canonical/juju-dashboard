/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { AuthHelpers } from "../helpers/auth-helpers";
import { JujuHelpers } from "../helpers/juju-helpers";

type Fixtures = {
  authHelpers: AuthHelpers;
  jujuHelpers: JujuHelpers;
};

export enum CloudAccessTypes {
  ADD_MODEL = "add-model",
}

export enum ModelAccessTypes {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export enum ResourceType {
  MODEL = "MODEL",
  USER = "USER",
  CLOUD = "CLOUD",
}

export type Resource = {
  resourceName: string | CloudAccessTypes;
  type: ResourceType;
  owner?: string;
};

const cleanupStack: Resource[] = [];

export const test = base.extend<Fixtures>({
  authHelpers: async ({ page }, use) => {
    await use(new AuthHelpers(page));
  },
  // eslint-disable-next-line no-empty-pattern
  jujuHelpers: async ({}, use) => {
    await use(new JujuHelpers(cleanupStack));
  },
});

export default test;
